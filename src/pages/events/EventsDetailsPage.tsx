import CardImage from "@/components/card-image";
import { getEventById } from "@/lib/events";
import type { OrganizerEvent } from "@/types";
import { useEffect, useState } from "react";
import { useParams } from "react-router";

export default function EventsDetailsPage() {
  const { id } = useParams<{ id: string }>();

  const [event, setEvent] = useState<OrganizerEvent>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getEventById(id)
      .then(setEvent)
      .finally(() => setTimeout(() => setLoading(false), 1000));
  }, [id]);

  if(loading) return <div>Memuat .........</div>

  return (
    <div className="p-6 grid grid-cols-7">
      <div className="col-span-5 flex flex-col">
        {event && Object.values(event).join("-")}
      </div>
      <div className="col-span-2">{id}</div>
    </div>
  );
}
