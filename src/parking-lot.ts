export interface Subscriber {
  notify(event: ParkingEvent): void;
}
export interface Publisher {
  subscribe(sub: Subscriber): void;
  unsubscribe(sub: Subscriber): void;
}
export interface ParkingEvent {
  name: string;
  occupied: number;
  capacity: number;
  action: 'enter' | 'exit';
}
export class ParkingLot implements Publisher {
  private subs: Subscriber[] = [];

  subscribe(sub: Subscriber) { this.subs.push(sub); }
  unsubscribe(sub: Subscriber) { this.subs = this.subs.filter(s => s!==sub); }

  private notifyAll(action: 'enter'|'exit') {
    const evt: ParkingEvent = {
      name: this.name,
      occupied: this.occupied,
      capacity: this.capacity,
      action
    };
    this.subs.forEach(s => s.notify(evt));
  }

  public enter() {
    if (this.occupied < this.capacity) {
      this.occupied++;
      this.notifyAll('enter');
    }
  }

  public exit() {
    if (this.occupied > 0) {
      this.occupied--;
      this.notifyAll('exit');
    }
  }
}

