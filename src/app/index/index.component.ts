import { Component, OnInit } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from 'rxjs';
import { GoogleChartInterface } from 'ng2-google-charts/google-charts-interfaces';
declare var $: any;

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent implements OnInit {

  constructor(private httpClient: HttpClient) { }

  image: string;
  sound: string;

  uploadEndpoint: string = 'https://cloud-videos20190514061132.azurewebsites.net/api/images'
  descEndpoint: string = 'https://cloud-videos20190514061132.azurewebsites.net/api/images/desc/'
  ttsEndpoint: string = 'https://cloud-videos20190514061132.azurewebsites.net/api/images/tts/'
  bucketUrl: string = 'https://cloudvideosstorage.file.core.windows.net/'
  token: string = ''


  ngOnInit() {
  }

  fileToUpload: File = null;

  public columnChart: GoogleChartInterface = {
    chartType: 'ColumnChart',
    dataTable: [['Label', 'Confidence'], ['', 0]],
    options: {
      title: 'Labels',
      animation: {
        duration: 1000,
        easing: 'out',
        startup: true,
      },
      height: 1000,
    }
  };

  postFile(fileToUpload: File): Observable<Object> {
    const endpoint = this.uploadEndpoint;
    const formData: FormData = new FormData();
    formData.append('fileKey', fileToUpload, fileToUpload.name);
    return this.httpClient
      .post(endpoint, formData)
  }

  handleFileInput(files: FileList) {
    let id: string
    this.fileToUpload = files.item(0);
    console.log(this.fileToUpload)
    this.postFile(this.fileToUpload).subscribe(
      data => {
        console.log("upload done")
        console.log(data)
        id = data["FileName"]
        this.image = this.bucketUrl + "images/" + id + ".jpg" + this.token;
        //id = "a3e45367-2783-4d87-b397-07777a73ca56"
        console.log(id)
        let endpoint = this.descEndpoint + id
        this.httpClient.get(endpoint).subscribe(
          data => {
            console.log("desc done")
            console.log(data)

            this.columnChart.dataTable = [['Label', 'Confidence']]
            data["tags"].forEach(element => {
              this.columnChart.dataTable.push([element.name, element.confidence])
            });
            this.columnChart.component.draw()

            let endpoint = this.ttsEndpoint
            let body = { text: data["description"]["captions"][0]["text"] }
            console.log(body)
            this.httpClient.post(endpoint, body).subscribe(
              data => {
                console.log("tts done")
                console.log(data)
                this.sound = this.bucketUrl + "sounds/" + data + this.token
                let audio:any = document.getElementById('audio')
                audio.load()

              },
              error => {
                console.log("error at post tts")
                console.log(JSON.stringify(error))
              }
            )
          },
          error => {
            console.log("error at get desc")
            console.log(JSON.stringify(error))
          }
        )
      },
      error => {
        console.log("error at upload")
        console.log(JSON.stringify(error))
      })
  }

}
