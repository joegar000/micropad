import { Button, Input, useCarousel } from "micropad-ui";
import { usePage } from "../../model/page";
import { observer } from "mobx-react-lite";


const PageMenu = observer(() => {
  const page = usePage();
  const { api: carouselApi } = useCarousel();
  return (
    <>
      <div className="px-2 flex">
        <Input className="me-1" type="number" min={1} max={25} value={page.data.columns}
          onChange={e => {
            page.data.columns = Number(e.target.value);
          }}
        />
        x
        <Input className="ms-1" type="number" min={1} max={25} value={page.data.rows}
          onChange={e => {
            page.data.rows = Number(e.target.value);
          }}
        />
      </div>
      <div className="px-2">
        <Button variant="secondary"
          onClick={() => {
            page.layout.addPage(page.index + 1);
            setTimeout(() => {
              carouselApi?.scrollTo(page.index + 1);
            }, 0);
          }}
        >
          Add Page
        </Button>
      </div>
      <div className="px-2">
        <Button variant="destructive" disabled={page.layout.pages.length === 1}
          onClick={() => {
            if (page.index === 0) {
              page.layout.removePage(0);
            } else if (page.index === page.layout.pages.length - 1) {
              page.layout.removePage(page.index);
              carouselApi?.scrollTo(page.index - 1, true);
            } else {
              page.layout.removePage(page.index);
            }
          }}
        >
          Delete Page
        </Button>
      </div>
    </>
  );
});
export default PageMenu;
