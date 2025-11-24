import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Hello World!');

  setLanguageAndLocation(language: string, location: string) {

    localStorage.setItem('locale', language.toLowerCase());
    window.location.reload();
  }
}
