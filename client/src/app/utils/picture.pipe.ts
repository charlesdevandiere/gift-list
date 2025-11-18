import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'picture',
  standalone: true
})
export class PicturePipe implements PipeTransform {

  public transform(picture: string | null | undefined): unknown {
    return `bi-${picture ?? 'person-fill'}`
  }

}
