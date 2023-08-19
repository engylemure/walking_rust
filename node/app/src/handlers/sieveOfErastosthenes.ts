import EventEmitter from "events";
import { Request, Response } from "express";
import { Worker, isMainThread, parentPort, workerData } from "worker_threads";

class SieveOfEratosthenes extends EventEmitter {
    private _isCalculating: boolean = false;
    boolArr: Array<boolean> = [true, true, false, true, false];
    lastCalculated: number = 5;

    calculate(n: number) {
        if (Number.isNaN(n)) throw new Error("Not a Number!");
        if (n <= this.lastCalculated) {
            return {
                amountOfPrimes: this.takePrimes(n).length,
                isCalculating: this.isCalculating
            }
        }
        this.isCalculating = true;
        this.algorithm(n);
        this.isCalculating = false;
        return { amountOfPrimes: this.takePrimes(n).length, isCalculating: this.isCalculating };
    }

    public get isCalculating() {
        return this._isCalculating;
    }

    private set isCalculating(value: boolean) {
        this.emit('isCalculating', value);
        this._isCalculating = value;
    }

    algorithm(n: number) {
        let i = 0;
        this.boolArr = new Array(n).fill(true);
        for (i = 2; i <= Math.sqrt(n); i++) {
            if (this.boolArr[i]) {
                for (let j = i * i; j < n; j += i) {
                    this.boolArr[j] = false;
                }
            }
        }
        this.lastCalculated = n;
    }

    calculateWithWorker(n: number) {
        if (isMainThread) {
            this.isCalculating = true;
            return new Promise<ReturnType<typeof this.calculate>>((res, rej) => {
                const worker = new Worker(__filename, {
                    workerData: n
                });
                worker.postMessage(n);
                worker.once('message', res);
                worker.on('error', rej);
                worker.on('exit', (code) => {
                    if (code !== 0)
                        rej(new Error(`Worker stopped with exit code ${code}`));
                });
            }).finally(() => this.isCalculating = false)
        } else {
            parentPort?.postMessage(this.calculate(n));
        }
    }

    takePrimes(n: number) {
        const primes = [];
        for (let i = 0; i < n - 2; i++) {
            if (this.boolArr[i]) {
                primes.push(i + 2);
            }
        };
        return primes;
    }
}

export const sieve = new SieveOfEratosthenes();

if (!isMainThread) {
    sieve.calculateWithWorker(workerData);
}


export function calculate(req: Request, res: Response) {
    res.json(sieve.calculate(Number(req.params.value)));
}

export function status(req: Request, res: Response) {
    res.json({ isCalculating: sieve.isCalculating })
}

export async function calculateWithWorker(req: Request, res: Response) {
    res.json(await sieve.calculateWithWorker(Number(req.params.value)))
}
