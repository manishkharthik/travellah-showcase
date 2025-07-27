export type Trip = {
    id: string;
    name: string;
    peopleInvited: string[];
    startDate: string;
    endDate: string;
    userId: string;
};

export interface TripListProps {
  trips: Trip[];
  showPopup: boolean;
  setShowPopup: (showPopup: boolean) => void;
    setTrips: React.Dispatch<React.SetStateAction<Trip[]>>;
}

export interface TripButtonPopupProp {
  showPopup: boolean;
  setShowPopup: (showPopup: boolean) => void;
  peopleToInvite: string[];
  setPeopleToInvite: (people: string[]) => void;
  error: string;
  setError: (error: string) => void;
  handleSubmitTrip: (e: React.FormEvent) => void;
  tripName: string;
  setTripName: (tripName: string) => void;
  tripStart: string;
  setTripStart: (tripStart: string) => void;
  tripEnd: string;
  setTripEnd: (tripEnd: string) => void;
}

export interface MainCardProps extends TripButtonPopupProp {
    trips: Trip[];  
     setTrips: React.Dispatch<React.SetStateAction<Trip[]>>;
}

export interface EventData {
  id: string;
  name: string;
  labelId?: string;
  day?: string | null | undefined;
  color: string;
  timeStart?: string | null | undefined;
  timeEnd?: string | null | undefined;
  originalEventId?: string | null | undefined;
  notes?: string | null;
  location?: any;
}