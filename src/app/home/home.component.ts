import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

import { VgAPI, VgStates } from 'videogular2/core';

import { SerieService } from '../shared/services/serie.service';

import { Serie } from '../shared/models/serie';
import { Saison } from '../shared/models/saison';
import { IPlayable } from 'videogular2/src/core/vg-media/i-playable';
import { Title } from '@angular/platform-browser';
import { Episode } from '../shared/models/episode';

@Component({
  moduleId: module.id,
  templateUrl: 'home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  public listSeries: Serie[] = [];
  public listSaisons: Saison[] = [];
  public listEpisodes = [];
  public selectedSerie: Serie = null;
  public selectedSaison: Saison = null;
  public selectedEpisode: Episode = null;
  public currentIndex: number;

  public showPlayer = false;

  public sources: Array<Object> = [];
  public subtitle = '';
  public bannerUrl = '';

  private baseUrl = '/rest/';
  private api: VgAPI;
  private routeSub: any;

  public idSerie: number;
  public idSeason: number;
  public idEpisode: number;

  constructor(
    private serieService: SerieService,
    protected route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private titleService: Title
  ) {
  }

  public ngOnInit() {
    this.routeSub = this.route.params.subscribe((params) => {
      this.idSerie = +params['serie'];
      this.idSeason = params['season'];
      this.idEpisode = params['episode'];
    });

    this.loadAllSeries();
  }

  public onPlayerReady(api: VgAPI) {
    this.api = api;

    this.api.getDefaultMedia().subscriptions.ended.subscribe(() => {
      // Set the video to the beginning
      this.api.getDefaultMedia().currentTime = 0;
    });
  }

  public onChangeSerie() {
    this.selectedSaison = null;
    this.selectedEpisode = null;
    this.listSaisons = [];
    this.listEpisodes = [];
    this.showPlayer = false;
    this.bannerUrl = null;

    this.serieService.getById(this.selectedSerie.indexerid).subscribe(saisons => {
      this.listSaisons = saisons;
      this.bannerUrl = `/rest/resource/${this.selectedSerie.indexerid}/banner`;

      this.selectedSaison = this.listSaisons.find((saison: Saison) => {
        return saison.index === this.idSeason;
      });
      if (this.selectedSaison) {
        this.onChangeSaison();
      } else if (saisons.length === 1) {
        this.selectedSaison = saisons[0];
        this.onChangeSaison();
      } else {
        this.location.go(`/${this.selectedSerie.indexerid}`);
        this.titleService.setTitle('Streamer.io - ' + this.selectedSerie.show_name);
      }
    });
  }

  public onChangeSaison() {
    this.listEpisodes = this.selectedSaison.episodes;
    this.selectedEpisode = this.listEpisodes.find((episode: any) => {
      return episode.id === this.idEpisode;
    });
    if (this.selectedEpisode) {
      this.onChangeEpisode();
    } else {
      this.location.go(`/${this.selectedSerie.indexerid}/${this.selectedSaison.index}`);
      this.titleService.setTitle('Streamer.io - ' + this.selectedSerie.show_name + ' - Saison ' + this.selectedSaison.index);
      this.selectedEpisode = null;
      this.showPlayer = false;
    }
  }

  public onChangeEpisode() {
    this.currentIndex = this.selectedSaison.episodes.indexOf(this.selectedEpisode);
    this.sources = [{
      url: this.baseUrl + 'stream/' + this.selectedSerie.indexerid + '/' + this.selectedSaison.index + '/' + this.selectedEpisode.id,
      type: 'video/mp4'
    }];
      // tslint:disable-next-line:max-line-length
    this.subtitle = this.baseUrl + 'subtitle/' + this.selectedSerie.indexerid + '/' + this.selectedSaison.index + '/' + this.selectedEpisode.id;
    this.showPlayer = true;
    this.api.getDefaultMedia().addTextTrack('subtitles', 'English', 'fr');

    // Change url
    this.location.go(`/${this.selectedSerie.indexerid}/${this.selectedSaison.index}/${this.selectedEpisode.id}`);
    this.titleService.setTitle('Streamer.io - ' + this.selectedSerie.show_name +
    ' - Saison ' + this.selectedSaison.index +
    ' - Episode ' + this.selectedEpisode.id + ' : ' + this.selectedEpisode.name);
  }

  @HostListener('window:keydown', ['$event'])
  public onKeyDown(event: KeyboardEvent) {
    // On press Space (32)
    if (event.keyCode === 32) {
      event.preventDefault();
      if (this.api.getDefaultMedia().state === VgStates.VG_PLAYING) {
        this.api.getDefaultMedia().pause();
      } else if (this.api.getDefaultMedia().state === VgStates.VG_PAUSED) {
        this.api.getDefaultMedia().play();
      }
    }
  }

  public onGoToPrev() {
    const index = this.currentIndex - 1;
    const nextEpisode = index >= 0 ? this.selectedSaison.episodes[index] : null;
    if (nextEpisode) {
      this.selectedEpisode = nextEpisode;
      this.idEpisode = nextEpisode.id;
      this.router.navigate(['/', this.selectedSerie.indexerid, this.selectedSaison.index, nextEpisode.id]);
      this.onChangeEpisode();
    }
  }

  public onGoToNext() {
    const index = this.currentIndex + 1;
    const nextEpisode = this.selectedSaison.episodes.length > index ? this.selectedSaison.episodes[index] : null;
    if (nextEpisode) {
      this.selectedEpisode = nextEpisode;
      this.idEpisode = nextEpisode.id;
      this.router.navigate(['/', this.selectedSerie.indexerid, this.selectedSaison.index, nextEpisode.id]);
      this.onChangeEpisode();
    }
  }

  private loadAllSeries() {
    this.serieService.getAll().subscribe(series => {
      this.listSeries = series;
      this.selectedSerie = this.listSeries.find((serie: Serie) => {
        return serie.indexerid === this.idSerie;
      });
      if (this.selectedSerie) {
        this.onChangeSerie();
      }
    });
  }

  public ngOnDestroy() {
    this.routeSub.unsubscribe();
  }

}
