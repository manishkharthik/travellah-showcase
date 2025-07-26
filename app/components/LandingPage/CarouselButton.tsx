type CarouselButtonProps = {
  prev: string;
  next: string;
};

const CarouselButton = ({ prev, next }: CarouselButtonProps) => {
  return (
    <div className="absolute left-5 right-5 bottom-5 flex justify-between z-20">
      <a
        href={`#${prev}`}
        className="btn btn-circle border-2 border-white bg-transparent text-white hover:bg-white hover:text-black"
      >
        ❮
      </a>
      <a
        href={`#${next}`}
        className="btn btn-circle border-2 border-white bg-transparent text-white hover:bg-white hover:text-black"
      >
        ❯
      </a>
    </div>
  );
};

export default CarouselButton;
