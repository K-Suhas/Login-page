import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app';
import { routes } from './app/app.routes';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    importProvidersFrom(HttpClientModule)   // ✅ register HttpClient for services
  ]
});
