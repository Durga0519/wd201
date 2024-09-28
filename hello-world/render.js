const time =  async (ms)=>{
    return new  Promise((resolve, reject)=>{
        setTimeout(()=>{
            resolve();
        }, ms);
    })
};

const fetchuserDetails= async(userId) =>{
    console.log("Fetching user details");
    await time(500);
    return `http://image.example.com/${userId}`;
};
const downloadimage = async(imageUrl) =>{
    console.log("Downloading image");
    await time(500);
    return `image data for ${imageUrl}`;
};
const render= async(image) => {
    await time(300);
    console.log("Render image");
};

const run= async() =>{
    const imageUrl = await fetchuserDetails("Prasad");
    const imageData = await downloadimage(imageUrl);
    await render(imageData)
}

run();