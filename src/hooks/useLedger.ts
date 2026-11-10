/**
 * Selector subscription to the ledger store. Components pull the one value they
 * need instead of re-rendering on every unrelated write.
 */
import {useEffect, useRef, useState} from 'react';
import type {LedgerState} from '../game/ledgerStore';
import {getState, subscribe} from '../game/ledgerStore';

export function useLedger<T>(selector: (s: LedgerState) => T): T {
  const [value, setValue] = useState<T>(() => selector(getState()));
  const selectorRef = useRef(selector);
  selectorRef.current = selector;

  useEffect(() => {
    const read = () => {
      const next = selectorRef.current(getState());
      setValue(prev => (Object.is(prev, next) ? prev : next));
    };
    read();
    return subscribe(read);
  }, []);

  return value;
}
