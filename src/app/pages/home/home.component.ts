import { Component, OnInit, Renderer2, ViewChild, signal, inject, ElementRef, OnDestroy, effect } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { debounceTime, fromEvent, map } from 'rxjs';
import { NgClass } from '@angular/common';
import { Subscription } from 'rxjs'
import { CountriesService } from '@core/countries/countries.service';
import { Country } from '@core/interfaces/country';
import { forkJoin } from 'rxjs';
import { StateService } from '@core/state/state.service';
import { MatDialog, MatDialogRef, MatDialogState } from '@angular/material/dialog';
import { PopupComponent } from '@pages/home/core/popup/popup.component';
import { IContinent } from '@core/interfaces/continent';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    NgClass,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    ReactiveFormsModule,
    MatCardModule,
    MatListModule,
    MatDividerModule,
    MatButtonModule,
    MatMenuModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {

  @ViewChild('gridcards') gridcards!: ElementRef<HTMLDivElement>;
  @ViewChild('contentmain') contentmain!: ElementRef<HTMLDivElement>;
  searchControl = new FormControl('P');
  showDetail = signal(false);
  renderer = inject(Renderer2);
  continents = signal<IContinent[]>([]);
  selectedContinents = signal<IContinent[]>([]);
  countries = signal<Country[]>([]);
  country = signal<Country>({
    code: "",
    name: "",
    continent: {
      code: "",
      name: ""
    },
    capital: "",
    languages: [],
    currencies: [],
    states: [],
    flags: {
      alt: '',
      png: "",
      svg: ""
    },
    webformatURL: ""
  });
  $continentForContinentsSubscription: Subscription | null = null;
  $countriesSubscription: Subscription | null = null;
  $countriesForContinentsSubscription: Subscription | null = null;
  $resizeSubscription: Subscription | null = null;
  $formControlSubscription: Subscription | null = null;
  _countriesService = inject(CountriesService);
  _stateService = inject(StateService);
  showLoading = signal(false);
  #workingUpdate = () => {
    console.log('working', this._stateService.getValue());
    const response = this._stateService.getValue().country;
    if (!(response)) return;
    this.country.set(response);
  };
  MOBILE = 890;
  dialogRef!: MatDialogRef<PopupComponent, any>;
  dialog = inject(MatDialog);

  constructor() {
    effect(this.#workingUpdate, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    let me = this;
    me.__loadContinents();
    me.__loadData(<string>me.searchControl.value);
    me.formControlChangeValues();
    me.resizeChange();
  }

  ngOnDestroy(): void {
    let me = this;
    me.$continentForContinentsSubscription && me.$continentForContinentsSubscription.unsubscribe();
    me.$countriesSubscription && me.$countriesSubscription.unsubscribe();
    me.$countriesForContinentsSubscription && me.$countriesForContinentsSubscription.unsubscribe();
    me.$resizeSubscription && me.$resizeSubscription.unsubscribe();
    me.$formControlSubscription && me.$formControlSubscription.unsubscribe();
  }

  __loadContinents() {
    let me = this;
    me.$continentForContinentsSubscription = me._countriesService.getContinents().subscribe({
      next: (valueResponse) => {
        console.log('[SUCCESS-getContinents]', valueResponse);
        me.continents.set(valueResponse);
      },
      error: (error) => {
        console.log('[ERROR-getContinents]', error);
      },
      complete: () => {
        console.log('[COMPLETE-getContinents]');
      }

    });
  }

  formControlChangeValues() {
    let me = this;
    me.$formControlSubscription = me.searchControl.valueChanges.pipe(debounceTime(500)).subscribe((value) => {
      console.log('[NEW-VALUE]', value);
      me.customEventSearch(value);
    });
  }

  customEventSearch(value: string | null) {
    let me = this;
    if (!value) return me.__loadData("");
    me.closeDetail();
    me.country.set({
      code: "",
      name: "",
      continent: {
        code: "",
        name: ""
      },
      capital: "",
      languages: [],
      currencies: [],
      states: [],
      flags: {
        alt: '',
        png: "",
        svg: ""
      },
      webformatURL: ""
    });
    me.cleanContinents();
    me.__loadData(value);
  }

  resizeChange() {
    let me = this;
    me.$resizeSubscription = fromEvent(window, 'resize').pipe(map(() => window.innerWidth), debounceTime(250)).subscribe((data) => {
      console.log('[NEW-WIDTH]', data);
      if (me.MOBILE >= data && me.country().code != "") {
        console.log('[ADDITIONAL-ISEXISTS-MOBILE]');
        if (me.dialogRef && me.dialogRef.getState() === MatDialogState.OPEN) {
          console.log('[MAT-DIALOG-ISOPEN]');
        } else {
          console.log('[MAT-DIALOG-ISNOTOPEN]');
          me.openDialog(me.country());
          me.showDetail.set(false);
          me.renderer.removeClass(me.contentmain.nativeElement, 'change-content-main');
          me.renderer.removeClass(me.gridcards.nativeElement, 'change-grid-cards');
        }
      }
      console.log('me.MOBILE', me.MOBILE, 'data', data, 'me.country().code', me.country());
      if (me.MOBILE < data && me.country().code != "") {
        console.log('[ADDITIONAL-ISEXISTS-NOT-MOBILE]');
        if (me.dialogRef && me.dialogRef.getState() === MatDialogState.OPEN) {
          me.dialogRef.close({ event: 'CASE-SPECIAL' });
        }
        me.showDetail.set(true);
        me.renderer.addClass(me.contentmain.nativeElement, 'change-content-main');
        me.renderer.addClass(me.gridcards.nativeElement, 'change-grid-cards');
      }
    });
  }

  __loadData(regex: string) {
    let me = this;
    me.countries.set([]);
    me.showLoading.set(true);
    me.$countriesSubscription = me._countriesService.getCountries(regex).subscribe({
      next: (valueResponse) => {
        console.log('[SUCCESS-getCountries]', valueResponse.data);
        if (valueResponse.data['countries'].length === 0) {
          me.showLoading.set(false);
          return;
        }
        forkJoin(valueResponse.data['countries'].map(country => me._countriesService.getCountryRestFlag(country.code))).subscribe((value) => {
          for (let i = 0; i < value.length; i++) {
            let iterator = {
              ...valueResponse.data['countries'][i],
              flags: value[i][0].flags,
              webformatURL: ''
            }
            me._countriesService.getCountryImage(valueResponse.data['countries'][i].name).subscribe((data) => {
              if (!data) return;
              if (!(data.hits) || (data.hits.length == 0)) return;
              iterator = {
                ...iterator,
                webformatURL: data.hits[0].webformatURL
              }
              console.log('[ITERATOR]', iterator);
              me.countries.update((state) => [...state, iterator]);
              me.showLoading.set(false);
            });
          }
        });
      },
      error: (error) => {
        console.log('[ERROR-getCountries]', error);
        me.showLoading.set(false);
      },
      complete: () => {
        console.log('[COMPLETE-getCountries]');
      }
    });
  }

  __loadDataForContinents(filter: string[]) {
    let me = this;
    me.countries.set([]);
    me.showLoading.set(true);
    me.$countriesSubscription = me._countriesService.getCountriesForContinents(filter).subscribe({
      next: (valueResponse) => {
        console.log('[SUCCESS-getCountriesForContinents]', valueResponse.data);
        if (valueResponse.data['countries'].length === 0) {
          me.showLoading.set(false);
          return;
        }
        forkJoin(valueResponse.data['countries'].map(country => me._countriesService.getCountryRestFlag(country.code))).subscribe((value) => {
          for (let i = 0; i < value.length; i++) {
            let iterator = {
              ...valueResponse.data['countries'][i],
              flags: value[i][0].flags,
              webformatURL: ''
            }
            me._countriesService.getCountryImage(valueResponse.data['countries'][i].name).subscribe((data) => {
              if (!data) return;
              if (!(data.hits) || (data.hits.length == 0)) return;
              iterator = {
                ...iterator,
                webformatURL: data.hits[0].webformatURL
              }
              console.log('[ITERATOR]', iterator);
              me.countries.update((state) => [...state, iterator]);
              me.showLoading.set(false);
            });
          }
        });
      },
      error: (error) => {
        console.log('[ERROR-getCountriesForContinents]', error);
        me.showLoading.set(false);
      },
      complete: () => {
        console.log('[COMPLETE-getCountriesForContinents]');
      }
    });
  }

  isSelectedCountry(country: Country) {
    let me = this;
    console.log('[IS-SELECTED]', country);
    console.log('[WIDTH]', window.innerWidth);
    if (window.innerWidth <= me.MOBILE) {
      me._stateService.setValue(country);
      me.openDialog(country);
      return;
    }
    me._stateService.setValue(country);
    me.showDetail.set(true);
    me.renderer.addClass(me.contentmain.nativeElement, 'change-content-main');
    me.renderer.addClass(me.gridcards.nativeElement, 'change-grid-cards');
  }
  openDialog(country: Country): void {
    let me = this;
    me.dialogRef = me.dialog.open(PopupComponent, {
      data: country,
      width: '400px',
      minHeight: 400,
      maxHeight: '90vh'
    });

    me.dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed', result);
      if (result && result.event && result.event == 'CASE-SPECIAL') {
        return;
      }
      me.country.set({
        code: "",
        name: "",
        continent: {
          code: "",
          name: ""
        },
        capital: "",
        languages: [],
        currencies: [],
        states: [],
        flags: {
          alt: '',
          png: "",
          svg: ""
        },
        webformatURL: ""
      });

    });
  }

  closeDetail() {
    let me = this;
    console.log('[CLOSE]');
    me.showDetail.set(false);
    me.country.set({
      code: "",
      name: "",
      continent: {
        code: "",
        name: ""
      },
      capital: "",
      languages: [],
      currencies: [],
      states: [],
      flags: {
        alt: '',
        png: "",
        svg: ""
      },
      webformatURL: ""
    });
    me.renderer.removeClass(me.contentmain.nativeElement, 'change-content-main');
    me.renderer.removeClass(me.gridcards.nativeElement, 'change-grid-cards');
  }

  selectedContinent(continent: IContinent) {
    let me = this;
    me.closeDetail();
    me.country.set({
      code: "",
      name: "",
      continent: {
        code: "",
        name: ""
      },
      capital: "",
      languages: [],
      currencies: [],
      states: [],
      flags: {
        alt: '',
        png: "",
        svg: ""
      },
      webformatURL: ""
    })
    me.selectedContinents.update((data) => {
      const isExists = data.findIndex((e) => e.code == continent.code);
      if (isExists != -1) {
        data.splice(isExists, 1);
        return [...data];
      }
      return [...data, continent];
    });
    console.log('[SELECTED-CONTINENT]', continent, me.selectedContinents());
    if (me.selectedContinents().length <= 0) {
      me.cleanContinents();
      return;
    }
    console.log('[SEND-SELECTED-CONTINENTS]', me.selectedContinents().map((item) => item.code));
    me.__loadDataForContinents(me.selectedContinents().map((item) => item.code));
  }

  cleanContinents() {
    let me = this;
    me.selectedContinents.set([]);
    me.countries.set([]);
    me.closeDetail();
    console.log('[CLEAN-CONTINENTS]', me.selectedContinents());
    console.log('[CLEAN-COUNTRIES]', me.countries());
  }

  validateIsSelectedContent(continent: IContinent): boolean {
    let me = this;
    return me.selectedContinents().findIndex((e) => e.code == continent.code) != -1;
  }

  btnSearch() {
    let me = this;
    me.customEventSearch(me.searchControl.value);
  }



}
