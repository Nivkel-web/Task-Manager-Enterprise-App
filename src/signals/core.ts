import { useSyncExternalStore } from 'react';

/**
 * Enterprise Reactive Signals Engine
 * Inspired by Angular 16+ Signals (@angular/core) & TC39 Signals specification.
 * Features push-pull reactivity, dynamic dependency tracking, glitch-free memoization,
 * batching, and reactive telemetry inspection.
 */

export type SignalSubscriber = () => void;

export interface SignalNodeInfo {
  id: string;
  name: string;
  type: 'writable' | 'computed' | 'effect';
  dependentsCount: number;
  dependenciesCount: number;
  dependencies: string[];
  mutationCount: number;
  lastUpdated: number;
  currentValueSnapshot: unknown;
}

// Global active computation context for dynamic dependency tracking
let activeConsumer: ComputationNode | null = null;
let isBatching = false;
const pendingEffects = new Set<EffectNode>();

// Global registry for telemetry and Signals Inspector
export const signalRegistry = new Map<string, SignalNodeInfo>();
const registryListeners = new Set<() => void>();

export function subscribeRegistry(listener: () => void): () => void {
  registryListeners.add(listener);
  return () => registryListeners.delete(listener);
}

function notifyRegistryUpdated() {
  for (const listener of registryListeners) {
    try {
      listener();
    } catch (e) {
      console.error('Error in registry listener:', e);
    }
  }
}

let nextNodeId = 1;

export interface Signal<T> {
  (): T;
  get(): T;
  readonly id: string;
  readonly name: string;
  subscribe(listener: SignalSubscriber): () => void;
}

export interface WritableSignal<T> extends Signal<T> {
  set(value: T): void;
  update(updateFn: (value: T) => T): void;
  asReadonly(): Signal<T>;
}

interface ComputationNode {
  recordDependency(producer: BaseSignalNode<unknown>): void;
  notifyStale(): void;
}

abstract class BaseSignalNode<T> {
  readonly id: string;
  readonly name: string;
  protected subscribers = new Set<SignalSubscriber>();
  protected dependents = new Set<ComputationNode>();
  protected mutationCount = 0;
  protected lastUpdated: number = Date.now();

  constructor(name?: string) {
    this.id = `sig_${nextNodeId++}`;
    this.name = name || this.id;
  }

  abstract get(): T;

  subscribe(listener: SignalSubscriber): () => void {
    this.subscribers.add(listener);
    return () => {
      this.subscribers.delete(listener);
      this.syncRegistry();
    };
  }

  protected registerWithActiveConsumer() {
    if (activeConsumer) {
      activeConsumer.recordDependency(this as unknown as BaseSignalNode<unknown>);
    }
  }

  protected notifyConsumers() {
    // Notify computed dependents
    const deps = Array.from(this.dependents);
    for (const dep of deps) {
      dep.notifyStale();
    }

    // Notify UI / external subscribers
    for (const sub of Array.from(this.subscribers)) {
      try {
        sub();
      } catch (e) {
        console.error('Signal subscriber error:', e);
      }
    }
  }

  addDependent(consumer: ComputationNode) {
    this.dependents.add(consumer);
    this.syncRegistry();
  }

  removeDependent(consumer: ComputationNode) {
    this.dependents.delete(consumer);
    this.syncRegistry();
  }

  protected syncRegistry(type: 'writable' | 'computed' | 'effect' = 'writable', dependencies: string[] = []) {
    let valSnapshot: unknown = 'Uncalculated';
    try {
      const current = this.get();
      valSnapshot = typeof current === 'object' && current !== null
        ? Array.isArray(current)
          ? `Array(${current.length})`
          : current instanceof Set
          ? `Set(${current.size})`
          : 'Object'
        : current;
    } catch {
      valSnapshot = '<error>';
    }

    signalRegistry.set(this.id, {
      id: this.id,
      name: this.name,
      type,
      dependentsCount: this.dependents.size + this.subscribers.size,
      dependenciesCount: dependencies.length,
      dependencies,
      mutationCount: this.mutationCount,
      lastUpdated: this.lastUpdated,
      currentValueSnapshot: valSnapshot,
    });
    notifyRegistryUpdated();
  }
}

class WritableSignalImpl<T> extends BaseSignalNode<T> {
  private value: T;
  private equalityFn: (a: T, b: T) => boolean;

  constructor(initialValue: T, name?: string, equalityFn = Object.is) {
    super(name);
    this.value = initialValue;
    this.equalityFn = equalityFn;
    this.syncRegistry('writable');
  }

  get(): T {
    this.registerWithActiveConsumer();
    return this.value;
  }

  set(newValue: T): void {
    if (!this.equalityFn(this.value, newValue)) {
      this.value = newValue;
      this.mutationCount++;
      this.lastUpdated = Date.now();
      this.syncRegistry('writable');
      this.notifyConsumers();
    }
  }

  update(updateFn: (value: T) => T): void {
    this.set(updateFn(this.value));
  }

  asReadonly(): Signal<T> {
    const fn = (() => this.get()) as Signal<T>;
    fn.get = () => this.get();
    fn.subscribe = (l) => this.subscribe(l);
    Object.defineProperty(fn, 'id', { value: this.id });
    Object.defineProperty(fn, 'name', { value: this.name });
    return fn;
  }
}

class ComputedSignalImpl<T> extends BaseSignalNode<T> implements ComputationNode {
  private fn: () => T;
  private cachedValue!: T;
  private isDirty = true;
  private dependencies = new Set<BaseSignalNode<unknown>>();

  constructor(fn: () => T, name?: string) {
    super(name);
    this.fn = fn;
    this.syncRegistry('computed', []);
  }

  get(): T {
    this.registerWithActiveConsumer();

    if (this.isDirty) {
      this.recompute();
    }

    return this.cachedValue;
  }

  recordDependency(producer: BaseSignalNode<unknown>) {
    this.dependencies.add(producer);
    producer.addDependent(this);
  }

  notifyStale(): void {
    if (!this.isDirty) {
      this.isDirty = true;
      this.notifyConsumers();
    }
  }

  private recompute() {
    // Unlink previous dependencies
    for (const dep of this.dependencies) {
      dep.removeDependent(this);
    }
    this.dependencies.clear();

    const prevConsumer = activeConsumer;
    activeConsumer = this;
    try {
      this.cachedValue = this.fn();
      this.isDirty = false;
      this.mutationCount++;
      this.lastUpdated = Date.now();
      const depNames = Array.from(this.dependencies).map((d) => d.name);
      this.syncRegistry('computed', depNames);
    } finally {
      activeConsumer = prevConsumer;
    }
  }
}

class EffectNode implements ComputationNode {
  readonly id: string;
  readonly name: string;
  private fn: (onCleanup: (cleanupFn: () => void) => void) => void;
  private dependencies = new Set<BaseSignalNode<unknown>>();
  private cleanupFn?: () => void;
  private isDirty = true;
  private isDisposed = false;

  constructor(fn: (onCleanup: (cleanupFn: () => void) => void) => void, name?: string) {
    this.id = `eff_${nextNodeId++}`;
    this.name = name || this.id;
    this.fn = fn;
    this.run();
  }

  recordDependency(producer: BaseSignalNode<unknown>) {
    this.dependencies.add(producer);
    producer.addDependent(this);
  }

  notifyStale(): void {
    if (this.isDisposed) return;
    this.isDirty = true;
    if (isBatching) {
      pendingEffects.add(this);
    } else {
      this.run();
    }
  }

  run(): void {
    if (this.isDisposed) return;

    if (this.cleanupFn) {
      try {
        this.cleanupFn();
      } catch (e) {
        console.error('Effect cleanup error:', e);
      }
      this.cleanupFn = undefined;
    }

    for (const dep of this.dependencies) {
      dep.removeDependent(this);
    }
    this.dependencies.clear();

    const prevConsumer = activeConsumer;
    activeConsumer = this;
    try {
      this.fn((cb) => {
        this.cleanupFn = cb;
      });
      this.isDirty = false;
    } finally {
      activeConsumer = prevConsumer;
    }
  }

  dispose(): void {
    this.isDisposed = true;
    if (this.cleanupFn) {
      this.cleanupFn();
    }
    for (const dep of this.dependencies) {
      dep.removeDependent(this);
    }
    this.dependencies.clear();
    signalRegistry.delete(this.id);
    notifyRegistryUpdated();
  }
}

/**
 * Creates a WritableSignal with an initial value.
 * Syntax mirrors Angular's `signal(value)`
 */
export function signal<T>(initialValue: T, options?: { name?: string; equal?: (a: T, b: T) => boolean }): WritableSignal<T> {
  const node = new WritableSignalImpl(initialValue, options?.name, options?.equal);
  const fn = (() => node.get()) as WritableSignal<T>;
  fn.get = () => node.get();
  fn.set = (v: T) => node.set(v);
  fn.update = (u: (v: T) => T) => node.update(u);
  fn.asReadonly = () => node.asReadonly();
  fn.subscribe = (l: SignalSubscriber) => node.subscribe(l);
  Object.defineProperty(fn, 'id', { value: node.id });
  Object.defineProperty(fn, 'name', { value: node.name });
  return fn;
}

/**
 * Creates a Computed Signal that memoizes values and automatically updates when dependencies change.
 * Syntax mirrors Angular's `computed(() => ...)`
 */
export function computed<T>(fn: () => T, options?: { name?: string }): Signal<T> {
  const node = new ComputedSignalImpl(fn, options?.name);
  const signalFn = (() => node.get()) as Signal<T>;
  signalFn.get = () => node.get();
  signalFn.subscribe = (l: SignalSubscriber) => node.subscribe(l);
  Object.defineProperty(signalFn, 'id', { value: node.id });
  Object.defineProperty(signalFn, 'name', { value: node.name });
  return signalFn;
}

/**
 * Creates a reactive Effect that re-runs whenever signals read within it mutate.
 * Syntax mirrors Angular's `effect(() => ...)`
 */
export function effect(
  fn: (onCleanup: (cleanupFn: () => void) => void) => void,
  options?: { name?: string }
): () => void {
  const node = new EffectNode(fn, options?.name);
  return () => node.dispose();
}

/**
 * Executes a function untracked (does not register signals read as dependencies).
 * Syntax mirrors Angular's `untracked(() => ...)`
 */
export function untracked<T>(fn: () => T): T {
  const prevConsumer = activeConsumer;
  activeConsumer = null;
  try {
    return fn();
  } finally {
    activeConsumer = prevConsumer;
  }
}

/**
 * Batch multiple signal mutations into a single flush cycle.
 */
export function batch<T>(fn: () => T): T {
  if (isBatching) {
    return fn();
  }

  isBatching = true;
  try {
    return fn();
  } finally {
    isBatching = false;
    const effectsToRun = Array.from(pendingEffects);
    pendingEffects.clear();
    for (const eff of effectsToRun) {
      eff.run();
    }
  }
}

/**
 * React hook to read and subscribe to an Angular/JavaScript Signal.
 * Uses React 19's `useSyncExternalStore` for flicker-free synchronous reads.
 */
export function useSignal<T>(sig: Signal<T>): T {
  return useSyncExternalStore(
    (notify) => sig.subscribe(notify),
    () => sig.get(),
    () => sig.get()
  );
}
