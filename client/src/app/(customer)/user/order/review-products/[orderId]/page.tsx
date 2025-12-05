interface Props {
  params: {
    orderId: string;
  };
}

export default function ReviewOrderProductsPage({ params }: Props) {
  return (
    <div>
      <h1>Review Products</h1>
      <p>Review products for Order ID: {params.orderId}</p>
    </div>
  );
}
