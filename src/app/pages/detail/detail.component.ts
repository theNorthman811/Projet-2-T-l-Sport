import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as Highcharts from 'highcharts';
import { OlympicService } from '../../core/services/olympic.service';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Participation } from '../../core/models/Participation';

interface MedalsByEditionEntry {
  year: number;
  medalsCount: number;
}

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit, OnDestroy {
  countryId: number | undefined;
  countryDetails: any;
  private destroyer$: Subject<void> = new Subject<void>();
  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private olympicService: OlympicService
  ) {}

  ngOnInit() {
    this.route.params.pipe(takeUntil(this.destroyer$)).subscribe((params) => {
      this.countryId = +params['id'];
      if (this.countryId) {
        this.loadCountryDetails();
      } else {
        console.error('Country ID is undefined');
      }
    });
  }

  private loadCountryDetails() {
    this.subscriptions.push(
      this.olympicService.getCountryDetails(this.countryId!)
        .subscribe(
          (countryDetails: any) => {
            this.countryDetails = countryDetails;
            this.createLineChart();
          },
          (error) => {
            console.error('Failed to load country details:', error);
          }
        )
    );
  }

  private createLineChart() {
    if (this.countryDetails && this.countryDetails.participations) {
      const medalsByEditionData: MedalsByEditionEntry[] = this.countryDetails.participations.map(
        (participation: { year: number; medalsCount: number }) => ({
          year: participation.year,
          medalsCount: participation.medalsCount
        })
      );
  
      
      const categories: string[] = medalsByEditionData.map((entry) => entry.year.toString());
  
      const totalMedals = this.getTotalMedals();
      const totalAthletes = this.getTotalAthletes();
  
      Highcharts.chart('medalsByEditionChart', {
        title: {
          text: `Medals of ${this.countryDetails.country}`,
      
        },
        subtitle: {
          text: `<div style='display: flex; justify-content: space-between;'>
                  <div style='border: 1px solid  blue; padding: 10px; margin-right: 10px; border-radius: 5px; background-color: white;'>Total Medals: ${totalMedals}</div>
                  <div style='border: 1px solid  blue; padding: 10px; border-radius: 5px; background-color: white;'>Total Athletes: ${totalAthletes}</div>
                </div>`,
          useHTML: true
        },
        xAxis: {
          categories: categories,
          title: {
            text: 'Dates'
          }
        },
        yAxis: {
          title: {
            text: 'Number of Medals'
          }
        },
        series: [
          {
            name: 'Medals',
            data: medalsByEditionData.map((entry) => entry.medalsCount),
            type: 'line'
          }
        ],
        annotations: [
          {
            labelOptions: {
              backgroundColor: 'rgba(255,255,255,0.5)',
              verticalAlign: 'top',
              y: 15
            },
            labels: [
              {
                point: {
                  xAxis: 0,
                  yAxis: 0,
                  x: categories.length - 1,
                  y: totalMedals
                },
                text: `Total Medals: ${totalMedals}`,
                useHTML: true
              },
              {
                point: {
                  xAxis: 0,
                  yAxis: 0,
                  x: categories.length - 1,
                  y: totalAthletes
                },
                text: `Total Athletes: ${totalAthletes}`,
                useHTML: true
              }
            ]
          }
        ]
      });
    }
  }


  getTotalMedals(): number {
    return this.countryDetails?.participations
      ? this.countryDetails.participations.reduce((total: number, participation: Participation) => total + participation.medalsCount, 0)
      : 0;
  }

  getTotalAthletes(): number {
    return this.countryDetails?.participations
      ? this.countryDetails.participations.reduce((total: number, participation: Participation) => total + participation.athleteCount, 0)
      : 0;
  }

  ngOnDestroy() {
    this.destroyer$.next();
    this.destroyer$.complete();
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  navigateToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}
