import { Component, Input, Renderer2, ElementRef, Inject } from '@angular/core';
import { Platform } from '@ionic/angular';
import { DOCUMENT } from '@angular/common';
import { Plugins} from '@capacitor/core';

const { Geolocation, Network } = Plugins;

declare var google;

@Component({
  selector: 'google-map',
  templateUrl: './google-map.component.html',
  styleUrls: ['./google-map.component.scss'],
})
export class GoogleMapComponent {

  @Input("apiKey") apiKey: string;

  public map: any;
  public marker: any;
  public firstLoadFailed: boolean = false;
  private mapsLoaded: boolean = false;
  private networkHandler = null;
  public connectionAvailable = true;

  constructor(private renderer: Renderer2, private element: ElementRef, private platform: Platform,
    @Inject(DOCUMENT) private _document) { }

  public init(): Promise<any> {
    return new Promise((resolve, reject) => {
      if(typeof google == "undefined"){
        this.LoadSDK().then(
          res => {
            this.InitMap().then(
              res => {
                this.EnableMap();
                resolve(true);
              },
              err => {
                this.DisableMap();
                reject(err);
              }
            );
          },
          err => {
            this.firstLoadFailed = true;
            reject(err);
          }
        );
      } else {
        reject("Google maps already initialised");
      }
    });
  }

  private LoadSDK(): Promise<any>{
    this.AddConnectivityListeners();

    return new Promise((resolve, reject) => {
      if(!this.mapsLoaded){
        Network.getStatus()
        .then(
          status => {
            if(status.connected) {
              this.InjectSDK().then(
                res => {
                  resolve(true);
                },
                err => {
                  reject(err);
                }
              );
            } else{
              reject("Not online");
            }
          },
          err => {
            if(navigator.onLine){
              this.InjectSDK().then(
                res => {
                  resolve(true);
                },
                err => {
                  reject(err);
                }
              );
            } else {
              reject("Not online");
            }
          }
        )
        .catch(err => {
          console.warn(err);
        });
      } else {
        reject("SDK already loaded");
      }
    });
  }

  private InjectSDK(): Promise<any>{
    return new Promise((resolve, reject) => {
      window["mapInit"] = () => {
        this.mapsLoaded = true;
        resolve(true);
      };
      let script = this.renderer.createElement("script");
      script.id = "googleMaps";

      if (this.apiKey) {
        script.src =
        "https://maps.googleapis.com/maps/api/js?key=" +
        this.apiKey + "&callback=mapInit";
      } else {
        script.src = "https://maps.googleapis.com/maps/api/js?callback=mapInit";
      } 

      this.renderer.appendChild(this._document.body, script);
    });
  }

  private InitMap(): Promise<any>{
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition({ enableHighAccuracy: true,
      timeout: 10000 }).then(
        position => {
          console.log(position);
          let latLng = new
          google.maps.LatLng(position.coords.latitude,
          position.coords.longitude);
          let mapOptions = {
          center: latLng,
          zoom: 15
          };
          this.map = new
          google.maps.Map(this.element.nativeElement, mapOptions);
          resolve(true);
        },
        err => {
          console.log(err);
          reject("Could not initialise map");
        }
      );
    });
  }

  DisableMap(): void {
    this.connectionAvailable = false;
  }

  EnableMap(): void{
    this.connectionAvailable = true;
  }

  AddConnectivityListeners(): void {
    console.warn("Capacitor Network API does not have a wbe implementation currently. Test on a device.");

    if (this.platform.is("cordova")) {
      this.networkHandler =
      Network.addListener("networkStatusChange", status => {
        if (status.connected) {
          if (typeof google == "undefined" && this.firstLoadFailed) {
            this.init().then(
            res => {
              console.log("Google Maps ready.");
            },
            err => {
              console.log(err);
            });
          } else {
            this.EnableMap();
          }
        } else {
          this.DisableMap();
        }
      });
    }
  }

  public ChangeMarker(lat: number, lng: number): void {
    let latLng = new google.maps.LatLng(lat, lng);
    
    let marker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: latLng
    });
    
    // Remove existing marker if it exists
    if (this.marker) {
      this.marker.setMap(null);
    }
    
    // Add new marker
    this.marker = marker;
  }
}
