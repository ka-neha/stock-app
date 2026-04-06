import { Component, signal } from '@angular/core';
import { StockComponent } from './stock-dashboard/stock.component';


@Component({
  selector: 'app-root',
  imports: [StockComponent],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrls: ['./app.component.css'],
})
export class App {
  protected readonly title = signal('stock-app');

}
