import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OlympicService } from './core/services/olympic.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(private olympicService: OlympicService, private router: Router) {}

  ngOnInit(): void {
    this.olympicService.loadInitialData().pipe(take(1)).subscribe(() => {
      
      this.router.navigate(['/dashboard']);
    });
  }
}

