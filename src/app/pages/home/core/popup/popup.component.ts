import { Component, Inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule
} from '@angular/material/dialog';
import { Country } from '@core/interfaces/country';

@Component({
  selector: 'app-popup',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule, MatDialogModule, MatIconModule, MatListModule],
  templateUrl: './popup.component.html',
  styleUrl: './popup.component.scss'
})
export class PopupComponent {
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
  constructor(
    public dialogRef: MatDialogRef<PopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Country,
  ) {
    let me = this;
    me.country.set(data);
  }

  closeDetail() {
    this.dialogRef.close();
  }
}
