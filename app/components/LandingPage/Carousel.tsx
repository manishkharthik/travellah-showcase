import CarouselButton from "./CarouselButton";
import Overlay from "./Overlay";

const Carousel = () => {
  return (
    <div className="carousel w-full h-[75vh] relative">
      {/* Slide 1 */}
      <div id="slide1" className="carousel-item relative w-full h-full">
        <img
          src="/travel4.jpg"
          className="w-full object-cover h-full brightness-75"
        />

        {/* Overlay */}
        <Overlay />

        {/* Nav */}
        <CarouselButton prev="slide3" next="slide2" />
      </div>

      {/* Slide 2 */}
      <div id="slide2" className="carousel-item relative w-full h-full">
        <img
          src="/travel2.jpg"
          className="w-full object-cover h-full brightness-75"
        />

        <Overlay />

        <CarouselButton prev="slide1" next="slide3" />
      </div>

      {/*Slide 3*/}
      <div id="slide3" className="carousel-item relative w-full h-full">
        <img
          src="/travel3.jpeg"
          className="w-full object-cover h-full brightness-75"
        />

        <Overlay />

        <CarouselButton prev="slide2" next="slide1" />
      </div>
    </div>
  );
};

export default Carousel;
