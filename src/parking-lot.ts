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
export class ParkingLot {
  public occupied: number = 0;

  constructor(
    public name: string,
    public capacity: number,
  ) {}

  enter() {
    if (!this.isFull()) {
      this.occupied++;
    } else {
      throw new Error(`the parking lot is full`);
    }
  }

  exit() {
    if (!this.isEmpty()) {
      this.occupied--;
    } else {
      throw new Error(`the parking lot is empty`);
    }
  }

  isFull() {
    return this.occupied == this.capacity;
  }

  isEmpty() {
    return this.occupied == 0;
  }
}
