import { Carousel } from "react-bootstrap";
import "../css/ScamAlerts.css";
import { TfiAlert } from "react-icons/tfi";

const newsData = [
  {
    title: "Home Rental Scams Jump in Cases: Sun Xueling",
    link: "https://www.channelnewsasia.com/singapore/home-rental-scams-jump-cases-sun-xueling-3475761",
    image:
      "https://onecms-res.cloudinary.com/image/upload/s--Fi-iVz2j--/c_crop,h_843,w_1500,x_0,y_157/c_fill,g_auto,h_468,w_830/f_auto,q_auto/v1/mediacorp/cna/image/2023/04/27/iStock-1352174520.jpg?itok=TOV8SCXu",
  },
  {
    title:
      "Rental Scams Resurface: Sham Property Agents, Victims Millions Lost - Police",
    link: "https://www.todayonline.com/singapore/rental-scams-resurface-sham-property-agents-victims-millions-lost-police-2134416",
    image:
      "https://onecms-res.cloudinary.com/image/upload/s--tUDItGzf--/f_auto,q_auto/c_fill,g_auto,h_622,w_830/v1/mediacorp/tdy/image/2023/03/21/20230321_today_scam_sign_0.jpg?itok=YoWYUqCH",
  },
  {
    title:
      "Singapore Police Investigating Rental Scams That Defrauded Six Groups of Victims Over $30,000",
    link: "https://www.theonlinecitizen.com/2023/05/15/singapore-police-investigating-rental-scams-that-defrauded-six-groups-of-victims-over-s30000/",
    image:
      "https://www.theonlinecitizen.com/wp-content/uploads/2023/05/166a-yung-kuang.jpg",
  },
  {
    title:
      "Man Cheated 62 Victims from Over 10 Countries of $383k in One of S'pore's Largest Ever Rental Scams",
    link: "https://www.straitstimes.com/singapore/courts-crime/man-cheated-62-victims-from-over-10-countries-of-383k-in-one-of-s-pore-s-largest-ever-rental-scams",
    image:
      "https://static1.straitstimes.com.sg/s3fs-public/styles/large30x20/public/articles/2023/06/27/2023051186285632snapseed5_5.jpg?VersionId=vdd7G3bFJ_DlmFjwjUUvnldHLlEctPKX&itok=8oSFE3M2",
  },
  {
    title:
      "Police Advisory on Resurgence of Rental Scams Involving Scammers Impersonating Property Agents",
    link: "https://www.police.gov.sg/media-room/news/20230321_police_adv_on_resurgence_of_rental_scams_invlv_scammers_impersonating_prop_agents",
    image:
      "https://www.police.gov.sg/-/media/Spf/PNR/2023/Mar/20230321_police_adv_on_resurgence_of_rental_scams_involving_scammers_impersonating_property_agents_3.ashx?h=870&w=399&hash=D745411673E2EC1F492339CE7ED9E3DE",
  },
];

export default function ScamAlerts() {
  return (
    <div>
      <div className="warning-message">
        <TfiAlert /> DO NOT MAKE ANY PAYMENT WITHOUT VIEWING <TfiAlert />
      </div>

      <Carousel>
        {newsData.map((news, index) => (
          <Carousel.Item key={index}>
            <a href={news.link} target="_blank" rel="noopener noreferrer">
              <img
                className="d-block w-100 news-image"
                src={news.image}
                alt={`News ${index + 1}`}
              />
              <Carousel.Caption>
                <div className="carousel-caption">
                  <h3>{news.title}</h3>
                </div>
              </Carousel.Caption>
            </a>
          </Carousel.Item>
        ))}
      </Carousel>

      <div className="verification-links">
        Verify Agent with His/ Her Contact Number:{" "}
        <a
          href="https://www.cea.gov.sg/aceas/public-register/sales/1"
          target="_blank"
          rel="noreferrer"
        >
          CEA Website
        </a>
      </div>

      <div>
        Verify Landlord's Ownership at IRAS:{" "}
        <a
          href="https://mytax.iras.gov.sg/ESVWeb/default.aspx?target=PTEVLListIntro"
          target="_blank"
          rel="noreferrer"
        >
          IRAS Website
        </a>
      </div>

      <div>
        For HDB Rental - To Confirm Address Has Been Registered:{" "}
        <a
          href="https://iam.hdb.gov.sg/common/login?spcptracking=1693828913497__990c_e55b2653669a"
          target="_blank"
          rel="noreferrer"
        >
          HDB Website
        </a>
      </div>
    </div>
  );
}
