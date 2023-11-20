import { useState, useEffect } from 'react'
import { IPageInfo } from '../routes/meetings'
import { QueryDocumentSnapshot, collection, getCountFromServer, getDocs, limit, orderBy, query, startAfter } from 'firebase/firestore'
import { db } from '../firebase'
import { plainToClass } from 'class-transformer'

interface IFetchInfo {
  collNm: string
  perPage: number
}

function useFetchData<T>({ collNm, perPage }: IFetchInfo) {
  const [loading, setLoading] = useState(false)
  const [pageInfo, setPageInfo] = useState<IPageInfo>({
    totalCount: 0,
    curPage: 1,
    hasMore: false,
  })
  const [datas, setDatas] = useState<T[]>([])

  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null)

  useEffect(() => {
    const fetchDataFromDb = async () => {
      setLoading(true)
      let totalCnt = 0
      if (pageInfo.curPage === 1) {
        const coll = collection(db, collNm)
        const snapshot = await getCountFromServer(coll)
        totalCnt = snapshot.data().count
        setPageInfo((prev) => ({ ...prev, totalCount: snapshot.data().count, curPage: prev.curPage + 1 }))
      } else {
        totalCnt = pageInfo.totalCount
      }

      let doc
      if (lastDoc) {
        doc = query(collection(db, collNm), orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(perPage))
      } else {
        doc = query(collection(db, collNm), orderBy('createdAt', 'desc'), limit(perPage))
      }

      const documentSnapshots = await getDocs(doc)
      const fetchedDatas: T[] = []

      if (!documentSnapshots.empty) {
        documentSnapshots.forEach((doc) => {
          const data = doc.data()
          const date = new Date(data['createdAt'].toDate())
        })
      }
      const totalData = [...datas, ...fetchedDatas]
      const lastVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1]

      setDatas(totalData)
      setLastDoc(lastVisible)
      setPageInfo((prev) => ({ ...prev, hasMore: totalData.length < totalCnt }))

      setLoading(false)
    }

    fetchDataFromDb()
  }, [])

  return { loading, datas, pageInfo }
}

export default useFetchData
