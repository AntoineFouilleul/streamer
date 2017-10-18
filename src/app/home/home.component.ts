import { Component, OnInit } from '@angular/core';

import { VgAPI } from 'videogular2/core';

import { SerieService } from '../shared/services/serie.service';

import { Serie } from '../shared/models/serie';
import { Saison } from '../shared/models/saison';
import { IPlayable } from 'videogular2/src/core/vg-media/i-playable';

@Component({
  moduleId: module.id,
  templateUrl: 'home.component.html'
})
export class HomeComponent implements OnInit {

  api: VgAPI;

  listSeries: Serie[] = [];
  listSaisons: Saison[] = [];
  listEpisodes = [];
  selectedSerie: Serie = null;
  selectedSaison = null;
  selectedEpisode = null;

  showPlayer = false;

  sources: Array<Object> = [];
  subtitle = '';
  bannerUrl = '';

  private baseUrl = '/rest/';

  constructor(private serieService: SerieService) {
  }

  public ngOnInit() {
    this.loadAllSeries();
  }

  public onPlayerReady(api: VgAPI) {
    this.api = api;
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
    this.sources = [{
      url: this.baseUrl + 'stream/' + this.selectedSerie.indexerid + '/' + this.selectedSaison.index + '/' + this.selectedEpisode.id,
      type: 'video/mp4'
    }];
      // tslint:disable-next-line:max-line-length
    this.subtitle = this.baseUrl + 'subtitle/' + this.selectedSerie.indexerid + '/' + this.selectedSaison.index + '/' + this.selectedEpisode.id;
    this.showPlayer = true;
    this.api.getDefaultMedia().addTextTrack('subtitles', 'English', 'fr');
    // this.media;
  }

  private loadAllSeries() {
    this.serieService.getAll().subscribe(series => {
      this.listSeries = series;
    });
  }

}
