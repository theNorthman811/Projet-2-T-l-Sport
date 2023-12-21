import { Component, OnInit, OnDestroy } from '@angular/core';
import * as Highcharts from 'highcharts';
import { OlympicService } from '../../core/services/olympic.service';
import { Router } from '@angular/router';
import { olympic } from '../../core/models/Olympic';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  olympics: olympic[] | null = null;
  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private olympicService: OlympicService, private router: Router) {}

  ngOnInit() {
    this.olympicService.getOlympics()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (data: olympic[] | null) => {
          this.olympics = data;
          this.createPieChart();
        },
        (error: any) => {
          console.error('Failed to load Olympic data:', error);
        }
      );
  }

  private createPieChart() {
    if (this.olympics) {
      const chartData = this.olympics.map(country => ({
        name: country.country,
        y: this.calculateTotalMedals(country.participations)
      }));

      Highcharts.chart('myPieChart', {
        chart: {
          type: 'pie',
        },
        title: {
          text: 'Medals per Country',
        },
        plotOptions: {
          pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
              enabled: true,
              format: '<b>{point.name}</b>',
            },
            events: {
              click: (event: any) => {
                if (event.point) {
                  const countryIndex = event.point.index;
                  const countryId = this.olympics![countryIndex].id; // Non-null assertion operator (!) to tell TypeScript that it's safe
                  this.router.navigate(['/detail', countryId]);
                }
              },
            },
          },
        },
        tooltip: {
          pointFormat: '{point.name}: <b>{point.y}</b> medals',
        },
        series: [
          {
            type: 'pie',
            data: chartData,
            showInLegend: true,
          },
        ],
      });
    }
  }

  private calculateTotalMedals(participations: any[]): number {
    return participations.reduce((sum, participation) => sum + participation.medalsCount, 0);
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
