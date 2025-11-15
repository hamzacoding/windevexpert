import { firestore } from './firebase'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot,
  QueryConstraint,
  Timestamp
} from 'firebase/firestore'

export interface FirestoreDocument {
  id: string
  createdAt: Date
  updatedAt: Date
  [key: string]: any
}

export class FirestoreService {
  // Get a single document by ID
  static async getDocument<T>(
    collectionName: string,
    documentId: string
  ): Promise<(T & FirestoreDocument) | null> {
    try {
      const docRef = doc(firestore, collectionName, documentId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as T & FirestoreDocument
      }
      
      return null
    } catch (error) {
      console.error('Error getting document:', error)
      throw new Error('Failed to get document')
    }
  }

  // Get multiple documents with optional filtering
  static async getDocuments<T>(
    collectionName: string,
    constraints: QueryConstraint[] = []
  ): Promise<(T & FirestoreDocument)[]> {
    try {
      const collectionRef = collection(firestore, collectionName)
      const q = query(collectionRef, ...constraints)
      const querySnapshot = await getDocs(q)
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as T & FirestoreDocument
      })
    } catch (error) {
      console.error('Error getting documents:', error)
      throw new Error('Failed to get documents')
    }
  }

  // Create a new document
  static async createDocument<T>(
    collectionName: string,
    data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    try {
      const collectionRef = collection(firestore, collectionName)
      const now = Timestamp.now()
      
      const docRef = await addDoc(collectionRef, {
        ...data,
        createdAt: now,
        updatedAt: now,
      })
      
      return docRef.id
    } catch (error) {
      console.error('Error creating document:', error)
      throw new Error('Failed to create document')
    }
  }

  // Update an existing document
  static async updateDocument<T>(
    collectionName: string,
    documentId: string,
    data: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<void> {
    try {
      const docRef = doc(firestore, collectionName, documentId)
      const now = Timestamp.now()
      
      await updateDoc(docRef, {
        ...data,
        updatedAt: now,
      })
    } catch (error) {
      console.error('Error updating document:', error)
      throw new Error('Failed to update document')
    }
  }

  // Delete a document
  static async deleteDocument(
    collectionName: string,
    documentId: string
  ): Promise<void> {
    try {
      const docRef = doc(firestore, collectionName, documentId)
      await deleteDoc(docRef)
    } catch (error) {
      console.error('Error deleting document:', error)
      throw new Error('Failed to delete document')
    }
  }

  // Get documents with pagination
  static async getDocumentsPaginated<T>(
    collectionName: string,
    pageSize: number = 10,
    lastDoc?: DocumentSnapshot,
    constraints: QueryConstraint[] = []
  ): Promise<{
    documents: (T & FirestoreDocument)[]
    lastDocument: DocumentSnapshot | null
    hasMore: boolean
  }> {
    try {
      const collectionRef = collection(firestore, collectionName)
      const queryConstraints = [...constraints, limit(pageSize + 1)]
      
      if (lastDoc) {
        queryConstraints.push(startAfter(lastDoc))
      }
      
      const q = query(collectionRef, ...queryConstraints)
      const querySnapshot = await getDocs(q)
      
      const documents = querySnapshot.docs.slice(0, pageSize).map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as T & FirestoreDocument
      })
      
      const hasMore = querySnapshot.docs.length > pageSize
      const lastDocument = documents.length > 0 
        ? querySnapshot.docs[documents.length - 1] 
        : null
      
      return {
        documents,
        lastDocument,
        hasMore
      }
    } catch (error) {
      console.error('Error getting paginated documents:', error)
      throw new Error('Failed to get paginated documents')
    }
  }

  // Search documents by field
  static async searchDocuments<T>(
    collectionName: string,
    field: string,
    value: any,
    operator: '==' | '!=' | '<' | '<=' | '>' | '>=' | 'array-contains' | 'in' | 'array-contains-any' = '=='
  ): Promise<(T & FirestoreDocument)[]> {
    try {
      return await this.getDocuments<T>(collectionName, [
        where(field, operator, value)
      ])
    } catch (error) {
      console.error('Error searching documents:', error)
      throw new Error('Failed to search documents')
    }
  }

  // Get documents ordered by field
  static async getDocumentsOrdered<T>(
    collectionName: string,
    orderField: string,
    direction: 'asc' | 'desc' = 'desc',
    limitCount?: number
  ): Promise<(T & FirestoreDocument)[]> {
    try {
      const constraints: QueryConstraint[] = [orderBy(orderField, direction)]
      
      if (limitCount) {
        constraints.push(limit(limitCount))
      }
      
      return await this.getDocuments<T>(collectionName, constraints)
    } catch (error) {
      console.error('Error getting ordered documents:', error)
      throw new Error('Failed to get ordered documents')
    }
  }

  // Query documents with complex filtering and pagination
  static async queryDocuments<T>(
    collectionName: string,
    options: {
      where?: Array<{
        field: string
        operator: '==' | '!=' | '<' | '<=' | '>' | '>=' | 'array-contains' | 'in' | 'array-contains-any'
        value: any
      }>
      orderBy?: string
      orderDirection?: 'asc' | 'desc'
      limit?: number
      offset?: number
    } = {}
  ): Promise<(T & FirestoreDocument)[]> {
    try {
      const constraints: QueryConstraint[] = []
      
      // Add where constraints
      if (options.where && options.where.length > 0) {
        options.where.forEach(condition => {
          constraints.push(where(condition.field, condition.operator, condition.value))
        })
      }
      
      // Add order by constraint
      if (options.orderBy) {
        constraints.push(orderBy(options.orderBy, options.orderDirection || 'desc'))
      }
      
      // Add limit constraint
      if (options.limit) {
        constraints.push(limit(options.limit))
      }
      
      // Note: Firestore doesn't support offset directly, so we'll get all documents
      // and slice them client-side for now (not ideal for large datasets)
      const documents = await this.getDocuments<T>(collectionName, constraints)
      
      // Apply offset if specified
      if (options.offset && options.offset > 0) {
        return documents.slice(options.offset)
      }
      
      return documents
    } catch (error) {
      console.error('Error querying documents:', error)
      throw new Error('Failed to query documents')
    }
  }
}