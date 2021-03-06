import { Component, Injector } from '@angular/core';

import { EntityApiService } from '../entity-api.service';
import { DsBaseEntityListComponent } from '../../../components/base-list.component';
import { MicroserviceConfig } from '../../../../shared/providers/microservice.provider';
import 'rxjs/Rx';

@Component({
    selector: 'ds-identity-list',
    templateUrl: '../../../templates/generic-list.template.html'
})
export class DsIdentityListComponent extends DsBaseEntityListComponent {

    entityUrlPrefix = 'identities';

    constructor(injector: Injector,
                microserviceConfig: MicroserviceConfig,
                entityApiService: EntityApiService) {
        super(injector, microserviceConfig);
        this.entityApiService = entityApiService;
    }

    setupList() {
        super.setupList();
        this.columns = [
            { prop: 'title', cellTemplate: this.textCellTpl, headerTemplate: this.headerTpl, filterable: true },
        ];
    }
}
