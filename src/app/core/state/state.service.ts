import { Injectable, signal } from '@angular/core';
import { Country } from '@core/interfaces/country';

@Injectable({
  providedIn: 'root'
})
export class StateService {

  private state = signal<{ country: Country | null }>({
    country: null,
  });

  setValue(country: Country):void {
    let me = this;
    me.state.set({ country });
  }

  getValue() {
    let me = this;
    return me.state();
  }
}
