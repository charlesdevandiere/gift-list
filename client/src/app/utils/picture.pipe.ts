import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'picture'
})
export class PicturePipe implements PipeTransform {

  public transform(picture: string | null | undefined): unknown {
    if (picture && picture.length > 0) {
      return `bi-${picture}`
    } else {
      return 'bi-person-fill'
    }
  }

}
