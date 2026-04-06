import { Injectable, OnDestroy, signal, computed } from '@angular/core';
import { Stock, PriceDirection } from './stock.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class StockService implements OnDestroy {

  readonly stocks    = signal<Stock[]>([]);
  readonly dataMode  = signal<'live' | 'mock' | 'connecting'>('connecting');

  readonly priceDirections = computed<Record<string, PriceDirection>>(() =>
    this.stocks().reduce((acc, stock) => {
      acc[stock.symbol] = !stock.active        ? 'neutral'
                        : stock.price > stock.previousPrice ? 'up'
                        : stock.price < stock.previousPrice ? 'down'
                        : 'neutral';
      return acc;
    }, {} as Record<string, PriceDirection>)
  );

  private ws!: WebSocket;

  constructor() { this.connect(); }

  private connect(): void {
    this.ws = new WebSocket(environment.wsUrl);

    this.ws.onmessage = ({ data }) => {
      const msg = JSON.parse(data);

      if (msg.type === 'snapshot') {
        this.dataMode.set(msg.mode);
        this.stocks.set(msg.data.map((s: Stock) => ({ ...s, previousPrice: s.price, active: true })));
      }

      if (msg.type === 'update') {
        this.stocks.update(list =>
          list.map(s => {
            if (!s.active) return s;
            const fresh = msg.data.find((d: Stock) => d.symbol === s.symbol);
            return fresh ? { ...s, previousPrice: s.price, ...fresh } : s;
          })
        );
      }
    };

    this.ws.onclose = () => {
      this.dataMode.set('connecting');
      setTimeout(() => this.connect(), 3000);
    };

    this.ws.onerror = () => this.dataMode.set('mock');
  }

  toggleStock(symbol: string): void {
    this.stocks.update(list =>
      list.map(s => s.symbol === symbol ? { ...s, active: !s.active } : s)
    );
  }

  ngOnDestroy(): void { this.ws?.close(); }
}