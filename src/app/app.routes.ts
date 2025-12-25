import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Services } from './pages/services/services';
import { Demos } from './pages/demos/demos';
import { DemoDetail } from './pages/demo-detail/demo-detail';
import { About } from './pages/about/about';
import { Contact } from './pages/contact/contact';
import { SmallBusinessHome } from './demo-sites/small-business/home';
import { SmallBusinessServices } from './demo-sites/small-business/services';
import { SmallBusinessAbout } from './demo-sites/small-business/about';
import { SmallBusinessContact } from './demo-sites/small-business/contact';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'services', component: Services },
  { path: 'demos', component: Demos },
  { path: 'demos/:id', component: DemoDetail },
  { path: 'demo-sites/small-business', component: SmallBusinessHome },
  { path: 'demo-sites/small-business/services', component: SmallBusinessServices },
  { path: 'demo-sites/small-business/about', component: SmallBusinessAbout },
  { path: 'demo-sites/small-business/contact', component: SmallBusinessContact },
  { path: 'about', component: About },
  { path: 'contact', component: Contact },
  { path: '**', redirectTo: '' },
];
