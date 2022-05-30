// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
    result: any
}

type BookData = {
    count?: number;
    next: string;
    previous: string;
    results?: any[];
}

async function fetchData(tag: string) {
    const res = await fetch(`https://gutendex.com/books?topic=${tag}`)
    const data = await res.json()
    return data;
}


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {

    if (!req.query.tags) {
        return res.status(400).json({ result: 'tags must be provided'})
    }

    // we will take the tags from the query string and split them by comma
    const tagsSep: string[]  = (req.query.tags as string).split(',')

    // if the sortBy is not provided, set it to 'id'
    const sortBy: string = (req.query.sortBy as string) || 'id'

    // if the direction is not provided, set it to 'asc'
    const direction: string = (req.query.direction as string) || 'asc'

    const response = await Promise.all(tagsSep.map(tag => fetchData(tag)))

    const sortResults = (response: any[], sortBy: string, direction: string) => {
        const sorted = response.sort((a, b) => {
            return direction === 'asc' ? a[sortBy] - b[sortBy] : b[sortBy] - a[sortBy]
        })
        return sorted
    }

    const fixed: any[] = [];

    for(var postsBlock of response) {
        fixed.push(...postsBlock.posts)
    }

    const sorted: BookData[] = sortResults(fixed, sortBy, direction)

    res.status(200).json({ result: sorted })
}
