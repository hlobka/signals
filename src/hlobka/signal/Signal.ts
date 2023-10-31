import {PromiseList} from "@hlobka/promise-helper";

export class Signal<T = void> {
    private slotContexts: Map<any, Array<(value: T) => void>>;
    private slots: Array<(value: T, resolve?: () => void) => void>;
    private _onListenerAdded: Signal<void> | undefined;

    get onListenerAdded(): Signal<void> {
        this._onListenerAdded = this._onListenerAdded ?? new Signal<void>();
        return this._onListenerAdded;
    }

    constructor() {
        this.slots = [];
        this.slotContexts = new Map();
    }

    addOnce(slot: (value: T) => void, $this: any = null, highPriory?: boolean): Signal<T> {
        this.add(value => {
            this.remove(slot);
            slot(value);
        }, $this, highPriory);
        return <any> this;
    }

    reAdd(slot: (value: T, resolve?: () => void) => void, $this: any = null): Signal<T> {
        this.remove(slot);
        this.add(slot, $this);
        return this;
    }

    add(slot: (value: T, resolve?: () => void) => void, $this: any = null, highPriory?: boolean): Signal<T> {
        if ($this) {
            if (!this.slotContexts.has($this)) {
                this.slotContexts.set($this, []);
            }
            slot = slot.bind($this);
            if (highPriory) {
                this.slotContexts.get($this)?.unshift(slot);
            } else {
                this.slotContexts.get($this)?.push(slot);
            }
        }
        if (highPriory) {
            this.slots.unshift(slot);
        } else {
            this.slots.push(slot);
        }
        return this;
    }

    emit(payload: T): PromiseList<T> {
        return this.notify(this.slots, payload);
    }

    private notify(slots: Array<(value: T, resolve?: () => void) => void>, payload: T): PromiseList<T> {
        const promises: any[] = [];
        for (let i = slots.length; i--;) {
            const slot = slots[i];
            if (slot.length == 1) {
                slot.call(slot, payload);
            } else {
                promises.push(new Promise<T | void>(resolve => {
                    slot.call(slot, payload, resolve);
                }));
            }
        }
        return new PromiseList(promises);
    }

    remove(slot: (value: T) => void): Signal<T> {
        this.slots = this.slots.filter(function(item) {
            return item !== slot;
        });
        for (const key of Array.from(this.slotContexts.keys())) {
            const slots = (this.slotContexts.get(key) || []).filter(function(item) {
                return item !== slot;
            });
            for (let i = slots.length; i--;) {
                this.slotContexts.set(key, slots);
            }
        }
        return <any> this;
    }


    unload($this: any) {
        if (this.slotContexts.has($this)) {
            const slots = this.slotContexts.get($this) || [];
            for (let i = slots.length; i--;) {
                this.remove(slots[i]);
            }
            this.slotContexts.delete($this);
        }
    }

    async promise(): Promise<T> {
        return new Promise<T>(resolve => {
            this.addOnce(value => {
                resolve(value);
            });
        });
    }

    filter(cb: (payload: T) => boolean, $this: any = null) {
        const signal = new Signal<T>();
        const slot = (value: T) => {
            if (cb(value)) {
                signal.emit(value);
            }
        };
        this.add(slot, $this);
        return signal;
    }
}
