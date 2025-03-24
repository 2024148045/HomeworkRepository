export default async function Page({params}:{params:{pages:string}}){
    const resolvedParams = await params;
    return (
        <div>
            <p>param: {resolvedParams.pages}</p>
        </div>
    )
}