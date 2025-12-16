function LoadingIndicator({color="white", width="24px", height="24px"}) {
    return (
        <div className="fle items-center justify-center"
            style={{width: width, height:height, padding: '4px'}}>
            <div
                className="w-full h-full rounded-full animate-spin"
                style={{ border: '3px solid', borderColor: color, borderTopColor: 'transparent'}}
            />
        </div>
        


    )
}

export default LoadingIndicator