interface Props {
  params: {
    orderId: string;
  };
}

export default function OrderDetailPage({ params }: Props) {
  return (
    <div>
      <h1>Order Details</h1>
      <p>Order ID: {params.orderId}</p>
    </div>
  );
}
