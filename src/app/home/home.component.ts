import { Component, OnInit } from '@angular/core';

import { SerieService } from '../shared/services/serie.service';

import { Serie } from '../shared/models/serie';
import { Saison } from '../shared/models/saison';

@Component({
  moduleId: module.id,
  templateUrl: 'home.component.html'
})
export class HomeComponent implements OnInit {

  listSeries: Serie[] = [];
  listSaisons: Saison[] = [];
  listEpisodes = [];
  selectedSerie: Serie = null;
  selectedSaison = null;
  selectedEpisode = null;

  showPlayer = false;

  url = '';
  subtitle = '';
  bannerUrl = '';

  private baseUrl = '/rest/';

  constructor(private serieService: SerieService) {
  }

  public ngOnInit() {
    this.loadAllSeries();
  }

  public onChangeSerie() {
    this.selectedSaison = null;
    this.selectedEpisode = null;
    this.listSaisons = [];
    this.listEpisodes = [];
    this.showPlayer = false;

    this.serieService.getById(this.selectedSerie.indexerid).subscribe(saisons => {
      this.listSaisons = saisons;
      if (saisons.length === 1) {
        this.selectedSaison = saisons[0];
        this.onChangeSaison();
      }
    });
  }

  public onChangeSaison() {
    this.listEpisodes = this.selectedSaison.episodes;
    this.selectedEpisode = null;
    this.showPlayer = false;
  }

  public onChangeEpisode() {
    this.url = this.baseUrl + 'stream/' + this.selectedSerie.indexerid + '/' + this.selectedSaison.index + '/' + this.selectedEpisode.id;
    // tslint:disable-next-line:max-line-length
    this.subtitle = this.baseUrl + 'subtitle/' + this.selectedSerie.indexerid + '/' + this.selectedSaison.index + '/' + this.selectedEpisode.id;
    this.showPlayer = true;
  }

  private loadAllSeries() {
    this.serieService.getAll().subscribe(series => {
      this.listSeries = series;
    });
  }

}
