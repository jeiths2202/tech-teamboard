/**
 * 공통 DBIO Interface
 * SQL을 직접 사용하지 않고 CRUD 작업과 파라미터를 사용하는 추상화 계층
 * DB가 변경되더라도 이 인터페이스를 통해 데이터 접근 로직은 변경 없이 유지됨
 */

export interface QueryParams {
  where?: Record<string, unknown>;
  include?: Record<string, boolean | Record<string, unknown>>;
  orderBy?: Record<string, 'asc' | 'desc'> | Record<string, 'asc' | 'desc'>[];
  skip?: number;
  take?: number;
  select?: Record<string, boolean>;
}

export interface CreateParams<T> {
  data: T;
  include?: Record<string, boolean | Record<string, unknown>>;
}

export interface UpdateParams<T> {
  where: Record<string, unknown>;
  data: Partial<T>;
  include?: Record<string, boolean | Record<string, unknown>>;
}

export interface DeleteParams {
  where: Record<string, unknown>;
}

export interface DBIO<T> {
  // Create
  create(params: CreateParams<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>): Promise<T>;
  createMany(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<{ count: number }>;

  // Read
  findUnique(params: QueryParams): Promise<T | null>;
  findFirst(params?: QueryParams): Promise<T | null>;
  findMany(params?: QueryParams): Promise<T[]>;
  count(params?: Pick<QueryParams, 'where'>): Promise<number>;

  // Update
  update(params: UpdateParams<T>): Promise<T>;
  updateMany(params: UpdateParams<T>): Promise<{ count: number }>;

  // Delete
  delete(params: DeleteParams): Promise<T>;
  deleteMany(params?: DeleteParams): Promise<{ count: number }>;
}

/**
 * Prisma를 사용한 DBIO 구현체 팩토리
 * 어떤 모델이든 동일한 인터페이스로 CRUD 작업 수행 가능
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createDBIO<T>(model: any): DBIO<T> {
  return {
    async create(params) {
      return model.create({
        data: params.data as unknown,
        include: params.include,
      });
    },

    async createMany(data) {
      return model.createMany({
        data: data as unknown[],
      });
    },

    async findUnique(params) {
      return model.findUnique({
        where: params.where,
        include: params.include,
        select: params.select,
      });
    },

    async findFirst(params) {
      return model.findFirst({
        where: params?.where,
        include: params?.include,
        orderBy: params?.orderBy,
        skip: params?.skip,
        take: params?.take,
        select: params?.select,
      });
    },

    async findMany(params) {
      return model.findMany({
        where: params?.where,
        include: params?.include,
        orderBy: params?.orderBy,
        skip: params?.skip,
        take: params?.take,
        select: params?.select,
      });
    },

    async count(params) {
      return model.count({
        where: params?.where,
      });
    },

    async update(params) {
      return model.update({
        where: params.where,
        data: params.data as unknown,
        include: params.include,
      });
    },

    async updateMany(params) {
      return model.updateMany({
        where: params.where,
        data: params.data as unknown,
      });
    },

    async delete(params) {
      return model.delete({
        where: params.where,
      });
    },

    async deleteMany(params) {
      return model.deleteMany({
        where: params?.where,
      });
    },
  };
}
