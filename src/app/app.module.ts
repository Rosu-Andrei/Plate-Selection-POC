import {NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA} from '@angular/core';
import {BrowserModule, provideClientHydration} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {MultiWellPlateComponent} from './multi-well-plate/multi-well-plate.component';
import {MatRadioModule} from "@angular/material/radio";
import {FormsModule} from "@angular/forms";
import {MatButtonToggle} from "@angular/material/button-toggle";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {PlateTabsComponent} from './plate-tabs/plate-tabs.component';
import {MatTab, MatTabGroup} from "@angular/material/tabs";

@NgModule({
  declarations: [
    AppComponent,
    MultiWellPlateComponent,
    PlateTabsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatRadioModule,
    FormsModule,
    MatButtonToggle,
    FontAwesomeModule,
    MatTabGroup,
    MatTab
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  providers: [
    provideClientHydration(),
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
