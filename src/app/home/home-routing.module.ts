import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { HomePage } from "./home.page";

const routes: Routes = [
    {
        path: "tabs",
        component: HomePage,
        children: [
            {
                path: "location",
                children: [
                    {
                        path: "",
                        loadChildren: "../location/location.module#LocationPageModule"
                    }
                ]
            },
            {
                path: "camp",
                children: [
                    {
                        path: "",
                        loadChildren: "../camp-details/camp-details.module#CampDetailsPageModule"
                    }
                ]
            },
            {
                path: "me",
                children: [
                    {
                        path: "",
                        loadChildren: "../my-details/my-details.module#MyDetailsPageModule"
                    }
                ]
            }
        ]
    },
    {
        path: "",
        redirectTo: "/tabs/location",
        pathMatch: "full"
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class HomePageRoutingModule{}