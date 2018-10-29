import { Component, OnInit } from '@angular/core';
import { HistroryService } from '../shared/services/history.service';

@Component({
  moduleId: module.id,
  templateUrl: 'news.component.html',
  styleUrls: ['./news.component.scss']
})
export class NewsComponent implements OnInit {

  public history = [];

  constructor(
    private historyService: HistroryService,
  ) {}

  public ngOnInit() {
    this.historyService.getHistory().subscribe(history => this.history = history);
  }

}
