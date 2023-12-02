import { Injectable, inject } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { GET_COUNTRIES } from '@graphql/query';
import { Observable, of } from 'rxjs'
import { ApolloQueryResult } from '@apollo/client';
import { CountryGraphql } from '@core/interfaces/country';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { IContinent } from '@core/interfaces/continent';
@Injectable({
  providedIn: 'root'
})
export class CountriesService {

  private apollo = inject(Apollo);
  private http = inject(HttpClient)
  private urlApiRest = environment.apiRest;
  private urlApiPixabay = environment.apiPixabay;
  private tokenPixabay = environment.tokenPixabay;

  getCountries(regex: string): Observable<ApolloQueryResult<{ countries: CountryGraphql[] }>> {
    let me = this;
    return me.apollo.watchQuery<{ countries: CountryGraphql[] }>({
      query: GET_COUNTRIES,
      variables: {
        "filter": {
          "name": {
            regex
          }
        }
      },
      fetchPolicy: 'network-only'
    }).valueChanges;
  }

  getCountriesForContinents(filter: string[]): Observable<ApolloQueryResult<{ countries: CountryGraphql[] }>> {
    let me = this;
    return me.apollo.watchQuery<{ countries: CountryGraphql[] }>({
      query: GET_COUNTRIES,
      variables: {
        "filter": {
          "continent": {
            "in": filter
          }
        }
      },
      fetchPolicy: 'network-only'
    }).valueChanges;
  }

  getCountryRestFlag(code: string): Observable<any> {
    let me = this;
    return me.http.get(`${me.urlApiRest}/alpha/${code}`);
  }
  getCountryImage(value: string): Observable<any> {
    let me = this;
    return me.http.get(`${me.urlApiPixabay}/?key=${me.tokenPixabay}&q=${value}`);
  }

  getContinents(): Observable<IContinent[]> {
    return of<IContinent[]>([
      {
        name: 'Europa',
        urlImg: 'https://c8.alamy.com/compes/2jdj8p7/subregiones-de-europa-mapa-politico-la-geosquimia-que-subdivide-el-continente-europeo-en-europa-oriental-septentrional-meridional-y-occidental-2jdj8p7.jpg',
        code: 'EU'
      },
      {
        name: 'Africa',
        urlImg: 'https://blog.musicocracia.com/wp-content/uploads/2017/04/paises-de-africa.png',
        code: 'AF'
      },
      {
        name: 'Antarctica',
        urlImg: 'https://i.pinimg.com/474x/71/61/ec/7161ecc0b539c79404717078e99efddc.jpg',
        code: 'AN'
      },
      {
        name: 'Asia',
        urlImg: 'https://i.pinimg.com/564x/cb/99/23/cb9923286a18af85ee83448af201d666.jpg',
        code: 'AS'
      },
      {
        name: 'North America',
        urlImg: 'https://c8.alamy.com/compes/2j7cy2w/mapa-politico-de-america-del-norte-en-formato-vectorial-con-fronteras-nacionales-y-principales-ciudades-2j7cy2w.jpg',
        code: 'NA'
      },
      {
        name: 'Oceania',
        urlImg: 'https://www.delmundo.top/wp-content/uploads/2023/04/mapa-oceania.jpg',
        code: 'OC'
      },
      {
        name: 'South America',
        urlImg: 'https://www.mapascompass.cl/cdn/shop/products/zoom1sudam_b673db9f-9392-4bda-9ad7-862c2c3c9011_1400x.png?v=1626965544',
        code: 'SA'
      },
    ])

  }


}
