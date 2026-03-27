import { ApiPostRepository } from "@post/infrastructure/repositories";
import {
  GetAllPostsAsListUseCase,
  GetAllPostsAsDetailUseCase,
} from "@post/application/use-cases";

class AppContainer {
  private _postRepository?: ApiPostRepository;

  private get postRepository() {
    return (this._postRepository ??= new ApiPostRepository());
  }

  get getAllPostsAsListUseCase() {
    return new GetAllPostsAsListUseCase(this.postRepository);
  }

  get getAllPostsAsDetailUseCase() {
    return new GetAllPostsAsDetailUseCase(this.postRepository);
  }
}

export const container = new AppContainer();
