import { Subscriber, ParkingEvent } from './parking-lot';

export class Display implements Subscriber {
  notify(evt: ParkingEvent): void {
    const verb = evt.action === 'enter' ? 'entered' : 'left';
    console.log(
      `A car ${verb} the lot ${evt.name}: ${evt.occupied}/${evt.capacity} occupied.`
    );
  }
}
