import { useEffect, useState } from "react";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import VisibilityIcon from '@mui/icons-material/Visibility';

function HomePage() {

    const [newsData, setNewsData] = useState();

    const [currentArticle, setCurrentArticle] = useState();

    const [popularData, setPopularData] = useState();
    

    const getNewsData = () => {
        const requestOptions = {
            method: "GET",
            redirect: "follow"
        };
    
        // http://localhost:3001/api/rows
        fetch("https://apithanathtech.azurewebsites.net/api/rows", requestOptions)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // Parse JSON response
            })
            .then(result => {
                setNewsData(result); // Log the parsed JSON data
            })
            .catch(error => console.error('Fetch error:', error));
    };

    function convertToMMDDYYYY(isoDateStr) {
        const date = new Date(isoDateStr);
    
        const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are 0-based, so add 1
        const day = String(date.getUTCDate()).padStart(2, '0');
        const year = date.getUTCFullYear();
    
        return `${month}/${day}/${year}`;
    }

 
    const printArchiveList = () => {

        const reversedNewsData = Object?.values(newsData)?.reverse();

        return reversedNewsData?.map((article, index) => (
            <div className={`articleBlock dP p g ${currentArticle==(newsData?.length-1-index) ? 'articleSelected' : ''}`} key={index} onClick = {() => {setCurrentArticle(newsData?.length-1-index)}}>
                <div className="bold cC gR1">{convertToMMDDYYYY(article['Date'])}</div>

                <div className="gR2 cC">{article['Title']}</div>
            </div>
        ));
    };

    const changeArticle = (date) => {
        Object.keys(newsData).forEach((key) => {
            const article = newsData[key];
            if (article['Date'] === date) {
                setCurrentArticle(key);
            }
        })
    }

    const printMostPopular = () => {
        if(popularData){
            return Object?.values(popularData)?.map((article, index) => (
                <div className={`mostPopularBlock dP p g bR`} onClick = {() => {changeArticle(article['Date'])}}>
                    <div className="cC dP bold" key={index}>{article['Title']}</div>
                    <img className="popularImage cC" src={article['Image']} alt={article['Title']} />
                    <div className="gR2 cC dG">{article['Views']}<VisibilityIcon fontSize="small"/></div>
                </div>
            ));
        }
        
    };
   
    function sortByViews(newsData) {
        if(newsData){
            // Convert the object to an array of values
            const dataArray = Object?.values(newsData);
        
            // Sort the array by Views in descending order
            const sortedDataArray = dataArray?.sort((a, b) => b.Views - a.Views);
        
            // Optional: Convert the sorted array back to an object if needed
            const sortedDataDict = sortedDataArray?.reduce((acc, item) => {
                // Generate a unique key for each item if necessary
                // For example, if you have an ID or another unique property:
                const key = item.Date; // Adjust this based on your unique identifier
                acc[key] = item;
                return acc;
            }, {});
        
            // Update the state or perform other actions with the sorted data
            console.log(sortedDataDict);
            setPopularData(sortedDataDict);
        }
    }

    useEffect(() => {
        getNewsData();
    }, []);

    useEffect(() => {
        newsData != null && setCurrentArticle(newsData?.length-1);

        sortByViews(newsData);
    }, [newsData]);

    useEffect(() => {
        // Function to update view count
        const updateViewCount = async () => {
            const sessionId = sessionStorage.getItem(`viewed-${currentArticle+1}`);
            if (!sessionId) {
                try {
                    // https://apithanathtech.azurewebsites.net/ http://localhost:3001/api/updateViews
                    const response = await fetch('https://apithanathtech.azurewebsites.net/api/updateViews', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify( { articleDate: newsData[currentArticle]['Date']} ),
                    });

                    if (response.ok) {
                        // Mark the article as viewed in this session
                        sessionStorage.setItem(`viewed-${currentArticle+1}`, 'true');
                    } else {
                        console.error('Failed to update view count');
                    }
                } catch (error) {
                    console.error('Fetch error:', error);
                }
            }
        };

        updateViewCount();

    }, [currentArticle]);

    
    return (
      <div className="homeContainer g f">

        {/* Title */}
        
        <div className="homeTitle cC gR1">
            <div class="websiteTitle">
                <h1>Thanath Tech<span>Tech News Summarized</span></h1>
            </div>
            {/* <div className="bold">
                Quick Tech News
            </div> */}
        </div>

        {/* Archive List */}
        <div className="archiveListContainer oA">
            <div className="archiveTitle bold cC dP">
                Archive List
            </div>

            {newsData != null && printArchiveList()}
        </div>

        {/* Main Content*/}
        <div className="homeContent gR2 gC2">
            <div className="cC bold articleTitle dP">
                {currentArticle != null && newsData[currentArticle]['Title']}
            </div>
            <div className="cC dP dG">
                <CalendarMonthIcon/>
                {currentArticle != null && convertToMMDDYYYY(newsData[currentArticle]['Date'])}
            </div>
            <div className="cC dP dG">
                <VisibilityIcon/>
                {currentArticle != null && newsData[currentArticle]['Views']}
            </div>
            <div className="cC dP">
                {currentArticle != null && <img className="newsImage" src={newsData[currentArticle]['Image']} alt={newsData[currentArticle]['Title']} />}
            </div>
            <div className="cC dP">
                {currentArticle != null && newsData[currentArticle]['Content']}
            </div>
            <div className="cC dP">
                {currentArticle != null && newsData[currentArticle]['Summary']}
            </div>
        </div>

        {/* Most Viewed Articles */}
        <div className="mostPopularContainer">
            <div className="popularTitle bold cC dP">
                Most Popular
            </div>

            {printMostPopular()}
        </div>

      </div>
    );
  }
  
  export default HomePage;