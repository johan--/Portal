import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { MicroserviceConfig } from '../../microservice.provider';
import { EntityApiService } from '../entity-api.service';
import { DsBaseEntityListComponent } from '../../../components/base-list.component';
import 'rxjs/Rx';

@Component({
    selector: 'ds-service-list',
    templateUrl: '../../../templates/generic-list.template.html'
})
export class DsServiceListComponent extends DsBaseEntityListComponent {

    entityUrlPrefix = 'services';

    constructor(translate: TranslateService,
                microserviceConfig: MicroserviceConfig,
                entityApiService: EntityApiService) {
        super(translate, microserviceConfig);
        this.entityApiService = entityApiService;

    }

    setupList() {
        super.setupList();
        this.columns = [
            { prop: 'title', cellTemplate: this.textCellTpl, headerTemplate: this.headerTpl, filterable: true },
            { prop: 'presentation', cellTemplate: this.textCellTpl, headerTemplate: this.headerTpl, filterable: true },
        ];
    }
}
