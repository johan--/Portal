import { Component, Injector, Renderer } from '@angular/core';
import { Params } from '@angular/router';
import { DOCUMENT } from '@angular/platform-browser';

import { NgbModalOptions, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { ClipboardService } from 'ngx-clipboard';

import Tabs from '../../../../shared/components/tabs'
import { MicroserviceConfig } from '../../../../shared/providers/microservice.provider';
import { FormioApiService } from '../../../../shared/services/formio-api.service';
import { FormioController } from "../../../../shared/components/modals/formio-controller";
import { FormioModalFrameComponent } from "../../../../shared/components/modals/formio-modal-frame.component";

import { DsBaseEntityShowComponent } from '../../../components/base-entity-show.component';
import { EntityApiService } from '../entity-api.service';
import { ListQuery } from '../../../models/api-query';

import 'rxjs/Rx';
import { Observable } from 'rxjs/Observable';
import { Link } from '../../../models/link';

import findIndex from 'lodash/findIndex';


@Component({
    selector: 'ds-service-show',
    templateUrl: '../templates/service-show.template.html',
    styleUrls: ['../styles/service-show.scss'],
})
export class DsServiceShowComponent extends DsBaseEntityShowComponent implements FormioController {

    entityUrlPrefix = 'services';
    headerTitle = 'ds.microservices.entity.types.service';

    scenarios: Array<any> = [];
    loadingScenarios: boolean;

    scenariosTabs: Tabs;
    defaultTabIndex: number;

    formioModal: NgbModalRef;
    iFrameModalComponent: FormioModalFrameComponent;
    selectedScenario: any; // set upon clicking `Activate` on a scenario

    protected document: any;

    constructor(injector: Injector,
                protected renderer: Renderer,
                protected clipboard: ClipboardService,
                protected microserviceConfig: MicroserviceConfig,
                entityApiService: EntityApiService,
                protected formioApiService: FormioApiService) {

        super(injector, microserviceConfig);

        this.document = injector.get(DOCUMENT);
        this.entityApiService = entityApiService;
        this.formioApiService.setEntityApiService(entityApiService);
    }

    ngOnInit() {
        super.ngOnInit();
        this.backLink = new Link(['/pages/services'], 'general.menu.serviceDirectory');
    }

    ngOnDestroy() {
        if (this.scenariosTabs) {
            this.scenariosTabs.destroy();
        }

        if (this.formioModal) {
            this.formioModal.close();
        }

        super.ngOnDestroy();
    }

    protected prepareEntity(): Observable<{ entity: any, 'entityParent'?: any}> {
        return super.prepareEntity().flatMap(preparedObject => { // success
            if (this.scenarios.length === 0) {
                this.loadScenarios();
            }
            return Observable.of({'entity': preparedObject.entity, 'entityParent': preparedObject.entityParent});
        });
    }

    protected updateTranslations(lang: string): void {
        super.updateTranslations(lang);

        if (this.entity) {
            // this.createTabs();
            this.loadScenarios();
        }
    }

    protected loadScenarios() {
        this.loadingScenarios = true;

        const requestParams = {
            'service.uuid': this.entity.uuid,
            'order[weight]': 'asc'
        };

        this.route.params.subscribe((params: Params) => {
            let defaultScenarioUuid = params['scenarioUuid'];

            this.entityApiService.resource('scenarios').getList(requestParams).subscribe(scenariosData => {
                this.loadingScenarios = true;
                this.scenarios = [];
                scenariosData.forEach((scenario) => {
                    this.scenarios.push(scenario);
                });
            }, (error) => { // error
                console.log('Unable to fetch scenarios', error);
            }, () => { // complete
                this.loadingScenarios = false;

                if (this.scenarios.length > 0) {
                    // Pick default scenario index based on the scenario UUID passed in the URL
                    const defaultScenarioIndex = findIndex(this.scenarios, { 'uuid': defaultScenarioUuid });
                    this.createTabs(defaultScenarioIndex);
                    this.commitScenarioBreadcrumb(defaultScenarioIndex);
                }
            });
        }).unsubscribe();
    }

    /**
     * Build a breadcrumb for the selected scenario
     * @param scenarioIndex
     */
    protected commitScenarioBreadcrumb(scenarioIndex: number): void {
        if (scenarioIndex >= 0 && this.scenarios[scenarioIndex]) {
            let breadcrumb = this.buildBreadcrumb();
            breadcrumb.title = this.scenarios[scenarioIndex].title;
            this.commitBreadcrumb(breadcrumb, {forceIdenticalLink: true});
        }
    }
    /**
     *
     * @param defaultScenarioIndex
     */
    protected createTabs(defaultScenarioIndex?: number) {
        if (this.defaultTabIndex == null) {
            this.defaultTabIndex = defaultScenarioIndex >= 0 ? defaultScenarioIndex : 0;
        }

        // Transform scenarios markup into tabs
        setTimeout(() => {
            let tabsOptions = {};
            let tabsCallbacks = {
                'onTabChange': this.onTabChange.bind(this)
            };

            tabsOptions['default_tab'] = this.defaultTabIndex;
            this.scenariosTabs = new Tabs($('#scenarios-tabs'), tabsOptions, tabsCallbacks);
        }, 0);
    }

    /**
     * Tab-change handler.
     * This is called during Tabs initialization as well with the default tab index.
     * @param tabIndex
     */
    protected onTabChange(tabIndex: number) {
        // Update URL in address bar to show currently selected scenario
        if (tabIndex != this.defaultTabIndex && tabIndex < this.scenarios.length) {
            const currentScenarioUuid = this.scenarios[tabIndex].uuid;
            this.location.go(`/pages/services/${this.entity.uuid}/show/scenarios/${currentScenarioUuid}`);

            // Create and push a breadcrumb for the selected scenario
            this.commitScenarioBreadcrumb(tabIndex);
        }

        this.defaultTabIndex = tabIndex;
    }

    /**
     * Open scenario tab by zero-based index.
     * @param tabIndex
     */
    protected openTab(tabIndex: number) {
        this.scenariosTabs.openTabByIndex(tabIndex);
    }

    /**
     * Generate the redirection URL of a Scenario of type API or URL.
     * @param uuid Scenario UUID
     */
    protected getScenarioLinkUrl(uuid: string): string {
        return this.microserviceConfig.settings.entrypoint.url + 'scenarios/' + uuid + '/url';
    }

    /**
     * Copy a Scenario's absolute URL to clipboard.
     * This is a click handler for the scenario's link button in the template.
     * @param scenarioUuid String
     */
    protected copyScenarioUrlToClipboard(scenarioUuid: string): void {
        const currentUrl = this.document.location.href;
        const scenarioUrl = currentUrl.substr(0, currentUrl.indexOf('/show')) + '/show/scenarios/' + scenarioUuid;
        this.clipboard.copyFromContent(scenarioUrl, this.renderer);
        this.toastr.success(this.translate.instant('ds.messages.clipboardCopySucceeded'));
    }

    // // // Formio // // // // // // // // // // // // // // // // // // // // // // // //

    protected activateFormioForm(scenario: any) {
        this.openModalIFrame(scenario);
    }

    protected openModalIFrame(scenario: any) {
        this.selectedScenario = scenario;

        const modalOptions: NgbModalOptions = {
            size: 'lg',
            windowClass: 'formio-modal-frame',
        };

        const modalBreadcrumbsTitles = [
            this.getTranslatedPropertyValue(this.entity, 'title'),
            this.getTranslatedPropertyValue(this.selectedScenario, 'title'),
        ];

        this.formioModal = this.modal.open(FormioModalFrameComponent, modalOptions);
        this.iFrameModalComponent = this.formioModal.componentInstance;
        this.iFrameModalComponent.setFormioController(this);
        this.iFrameModalComponent.setBreadcrumbs(modalBreadcrumbsTitles);
    }

    requestFormioForm(): Observable<any> {
        return this.formioApiService.getForm('scenarios', this.selectedScenario.uuid);
    }

    submitFormioForm(formData: any): Observable<any> {
        return this.formioApiService.submitFormUsingPost('scenarios', this.selectedScenario.uuid, formData).flatMap(submissionResult => {
            this.formioModal.close();
            this.toastr.success(this.translate.instant('ds.microservices.entity.scenario.submissionSuccess'));
            return Observable.of(submissionResult);
        });
    }

    handleFormioFormEvent(lifeCycleMethod: string, arg: any) {
        // Do nothing
    }
}
