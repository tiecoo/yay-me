import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideServiceWorker } from '@angular/service-worker';
import { provideHttpClient } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

initNewRelic();

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
    provideHttpClient(),
    provideServiceWorker('ngsw-worker.js', {
      registrationStrategy: 'registerWhenStable:30000'
    })
  ]
}).catch(err => console.error(err));

// NREUM.info precisa estar completo ANTES do agente carregar — por isso injetamos
// o <script> do New Relic aqui, depois de configurar, em vez de depender de um
// script estático no index.html (que rodava antes deste arquivo e sempre lia a
// license key vazia).
function initNewRelic(): void {
  const licenseKey = (environment as any).newRelicLicenseKey;
  if (!licenseKey) {
    return;
  }

  (window as any).NREUM = (window as any).NREUM || {};
  (window as any).NREUM.info = {
    beacon: 'bam.nr-data.net',
    errorBeacon: 'bam.nr-data.net',
    licenseKey,
    applicationID: (environment as any).newRelicApplicationId || '',
    sa: 1
  };

  const agentScript = document.createElement('script');
  agentScript.src = 'https://js-agent.newrelic.com/nr-spa-1211.min.js';
  agentScript.defer = true;
  document.head.appendChild(agentScript);
}
