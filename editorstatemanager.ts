const prevState = this.getState();
        this.undoStack.push(prevState);
        this.redoStack = [];
        this.state = { ...this.state, ...updates };
        this.notifyListeners();
    }

    subscribe(listener: Listener<StateType>): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    undo(): void {
        if (this.undoStack.length === 0) return;
        const prevState = this.undoStack.pop()!;
        this.redoStack.push(this.getState());
        this.state = prevState;
        this.notifyListeners();
    }

    redo(): void {
        if (this.redoStack.length === 0) return;
        const nextState = this.redoStack.pop()!;
        this.undoStack.push(this.getState());
        this.state = nextState;
        this.notifyListeners();
    }

    private getState(): StateType {
        return { ...this.state };
    }

    private notifyListeners(): void {
        const currentState = this.getState();
        this.listeners.forEach(listener => listener(currentState));
    }
}