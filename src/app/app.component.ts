import { Component, ViewChild, signal, ChangeDetectorRef, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { MediaMatcher } from '@angular/cdk/layout';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { Subscription, filter } from 'rxjs';

interface IRoutesApp {
  nameRoute: string;
  pathRoute: string;
  iconName: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, MatToolbarModule, MatButtonModule, MatIconModule, MatSidenavModule, MatListModule, MatMenuModule, MatRadioModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'fractalup-falcon';
  @ViewChild('snav') sidenav!: MatSidenav;
  optionsMenu = signal<IRoutesApp[]>([
    {
      nameRoute: 'Home',
      pathRoute: 'home',
      iconName: 'home'
    },
    {
      nameRoute: 'Vista 1',
      pathRoute: 'view-1',
      iconName: 'build'
    },
    {
      nameRoute: 'Vista 2',
      pathRoute: 'view-2',
      iconName: 'construction'
    }
  ]);
  events: string[] = [];
  mobileQuery: MediaQueryList;
  routePath = signal('');
  router = inject(Router);
  $routeSubscription: Subscription | null = null;

  private _mobileQueryListener: () => void;

  constructor(changeDetectorRef: ChangeDetectorRef, media: MediaMatcher) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }
  ngOnInit(): void {
    let me = this;
    me.$routeSubscription = me.router.events.pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(event => {
        console.log("[ROUTE-EVENT]", event);
        if (event instanceof NavigationEnd) {
          me.routePath.set(event.url.slice(1));
        }
      });
  }

  ngOnDestroy(): void {
    let me = this;
    me.mobileQuery.removeListener(this._mobileQueryListener);
    me.$routeSubscription && me.$routeSubscription.unsubscribe();
  }

  toogleCustom() {
    //not working for my reason parece que es error de ellos
    let me = this;
    console.log("[SIDENAV]=>", me.sidenav);
    /* me.sidenav.close(); */
  }

  routeSelected(value: string) {
    let me = this;
    me.routePath.set(value);
  }
}
