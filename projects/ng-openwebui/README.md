# NgOpenwebUI

## A lightweight, reusable Angular UI component library that brings accessible, responsive web UI controls to your Angular apps. ng-openwebui provides a set of well-documented components and utilities (modals, tooltips, form controls, buttons, layout helpers, etc.) built with Angular 20 and designed to be easy to drop into your project — with theming and accessibility in mind.

![Visitors](https://api.visitorbadge.io/api/visitors?path=https%3A%2F%2Fgithub.com%2Fentanglesoftware-angular%2Fng-openwebui&labelColor=%231a214d&countColor=%23bb3624&style=flat)

NgOpenwebUI is an angular based lightweight, reusable Angular UI component library that brings accessible, responsive web UI controls to your Angular apps. ng-openwebui provides a set of well-documented components and utilities (modals, tooltips, form controls, buttons, layout helpers, etc.) built with Angular 20 and designed to be easy to drop into your project — with theming and accessibility in mind.


Made with <svg viewBox="0 0 1792 1792" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" style="height: 0.8rem;"><path d="M896 1664q-26 0-44-18l-624-602q-10-8-27.5-26T145 952.5 77 855 23.5 734 0 596q0-220 127-344t351-124q62 0 126.5 21.5t120 58T820 276t76 68q36-36 76-68t95.5-68.5 120-58T1314 128q224 0 351 124t127 344q0 221-229 450l-623 600q-18 18-44 18z" fill="#bb3624"></path></svg> by [Entangle Software Private Limited][espl]

## Installation

`npm i ng-openwebui`

## Usage

1. Register the `NgOpenwebUI` module into correct module (e.g app.module.ts)
   > `import { NgOpenwebUI } from 'ng-openwebui';`

```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgOpenwebUI, provideNgOpenwebUIConfig } from 'ng-openwebui';

const routes: Routes = [
  { path: '', component: NgOpenwebUI },
  { path: ':user_id', component: NgOpenwebUI },          // User chat without session
  { path: ':user_id/:session_id', component: NgOpenwebUI }, // Existing session
];

@NgModule({
  imports: [
    NgOpenwebUI,
    RouterModule.forChild(routes)
  ],
  providers: [
    provideNgOpenwebUIConfig({
      userId: '1',
      domain: 'http://localhost:8000'
    })
  ]
})
export class NgOpenwebUIWrapperModule {}
```


Hurray You are good to go !! 😋 😋

## API

> `import { NgOpenwebUI } from 'ng-openwebui';`



## Technologies Used

`ng-openwebui` uses following tech to work properly:

- [Angular 13] - HTML enhanced for web apps!
- [scss] - an extension to css


## Development

Want to contribute? Great! You are welcome here !! Let's build together 🙂

```sh
git clone https://github.com/entanglesoftware-angular/ng-openwebui
```

Open your favorite Terminal and navigate to the project directory.

```sh
cd ng-openwebui
```

Start the project using following command.

```sh
ng serve
```

Open your favorite browser and hit the url.

```sh
http://localhost:4200/
```

Make a change in your file and instantaneously see your updates!!

## License

MIT

## 🤝 Connect with us:

Want to stay tuned for latest updates or share feedbacks. Follow us at following:

<a href="https://twitter.com/espl_software">
  <img src="https://entanglesoftware-angular.github.io/svg-donught/assets/social/twitter.svg" alt="Entangle Software Private Limited | Twitter" width="32px"/>
</a>
<a href="https://github.com/entanglesoftware">
  <img src="https://entanglesoftware-angular.github.io/svg-donught/assets/social/github.svg" alt="Entangle Software Private Limited | Github" width="32px"/>
</a>
<a href="https://linkedin.com/company/entangle-software">
  <img src="https://entanglesoftware-angular.github.io/svg-donught/assets/social/linkedin.svg" alt="Entangle Software Private Limited | LinkedIn" width="32px"/>
</a>
<a href="https://www.instagram.com/entanglesoftware">
  <img src="https://entanglesoftware-angular.github.io/svg-donught/assets/social/instagram.svg" alt="Entangle Software Private Limited | Instagram" width="32px"/>
</a>
<a href="https://www.facebook.com/profile.php?id=100075464648655">
  <img src="https://entanglesoftware-angular.github.io/svg-donught/assets/social/facebook.svg" alt="Entangle Software Private Limited | Facebook" width="32px"/>
</a>

💬 If you have any question/feedback, please do not hesitate to reach out to us at tech@entanglesoftware.com

## 📈 GitHub Stats

[//]: # "These are reference links used in the body of this note and get stripped out when the markdown processor does its job. There is no need to format nicely because it shouldn't be seen. Thanks SO - http://stackoverflow.com/questions/4823468/store-comments-in-markdown-syntax"
[dill]: https://github.com/entanglesoftware-angular/svg-donught
[git-repo-url]: https://github.com/entanglesoftware-angular/svg-donught
[node.js]: http://nodejs.org
[twitter bootstrap]: http://twitter.github.com/bootstrap/
[jquery]: http://jquery.com
[@tjholowaychuk]: http://twitter.com/tjholowaychuk
[express]: http://expressjs.com
[angular 13]: https://angular.io/
[scss]: https://sass-lang.com/
[pldb]: https://github.com/joemccann/dillinger/tree/master/plugins/dropbox/README.md
[plgh]: https://github.com/joemccann/dillinger/tree/master/plugins/github/README.md
[plgd]: https://github.com/joemccann/dillinger/tree/master/plugins/googledrive/README.md
[plod]: https://github.com/joemccann/dillinger/tree/master/plugins/onedrive/README.md
[plme]: https://github.com/joemccann/dillinger/tree/master/plugins/medium/README.md
[plga]: https://github.com/RahulHP/dillinger/blob/master/plugins/googleanalytics/README.md
[espl]: https://entanglesoftware.com